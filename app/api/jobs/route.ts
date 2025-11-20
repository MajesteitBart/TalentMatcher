import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

const CreateJobSchema = z.object({
  company_id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, 'Invalid company ID format'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(20000),
  required_skills: z.array(z.string().min(1)).max(20).default([]),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  department: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  status: z.enum(['active', 'closed', 'draft']).default('active')
})

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const validatedData = CreateJobSchema.parse(body)

    const supabase = createAdminClient()

    const { data, error } = await (supabase.from('jobs') as any)
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
      logger.error('Error creating job', { error: error.message, data: validatedData })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create job',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    logger.info('Job created successfully', { jobId: data.id, companyId: data.company_id })

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    logger.error('Job creation API error', { error })

    if (error instanceof z.ZodError) {
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