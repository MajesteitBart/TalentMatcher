import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

const CreateCandidateSchema = z.object({
  company_id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, 'Invalid company ID format'),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email is required'),
  cv_text: z.string().min(1, 'CV text is required').max(10000),
  cv_file_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  linkedin_url: z.string().url().optional().or(z.literal(''))
})

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const validatedData = CreateCandidateSchema.parse(body)

    const supabase = createAdminClient()

    const { data, error } = await (supabase.from('candidates') as any)
      .insert(validatedData)
      .select(`
        *,
        company: companies (
          id,
          name,
          domain
        )
      `)
      .single()

    if (error) {
      logger.error('Error creating candidate', { error: error.message, data: validatedData })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create candidate',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    logger.info('Candidate created successfully', { candidateId: data.id, companyId: data.company_id })

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    logger.error('Candidate creation API error', { error })

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', (error as any).errors)
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: (error as any).errors
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}