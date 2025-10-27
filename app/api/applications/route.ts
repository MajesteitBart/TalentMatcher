import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

const CreateApplicationSchema = z.object({
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid(),
  status: z.enum(['pending', 'reviewing', 'interviewing', 'rejected', 'accepted']).default('pending')
})

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const validatedData = CreateApplicationSchema.parse(body)

    const supabase = createAdminClient()

    // Check if candidate exists
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('id, name')
      .eq('id', validatedData.candidate_id)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Candidate not found',
          code: 'CANDIDATE_NOT_FOUND'
        }
      }, { status: 404 })
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, company_id')
      .eq('id', validatedData.job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND'
        }
      }, { status: 404 })
    }

    // Check if application already exists
    const { data: existingApplication, error: existingError } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', validatedData.candidate_id)
      .eq('job_id', validatedData.job_id)
      .single()

    if (existingApplication) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Application already exists for this candidate and job',
          code: 'APPLICATION_EXISTS'
        }
      }, { status: 409 })
    }

    // Create the application
    const { data, error } = await (supabase.from('applications') as any)
      .insert(validatedData)
      .select(`
        *,
        candidate: candidates (
          id,
          name,
          email
        ),
        job: jobs (
          id,
          title,
          department,
          company: companies (
            id,
            name
          )
        )
      `)
      .single()

    if (error) {
      logger.error('Error creating application', { error: error.message, data: validatedData })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create application',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    logger.info('Application created successfully', {
      applicationId: data.id,
      candidateId: data.candidate_id,
      jobId: data.job_id,
      candidateName: candidate.name,
      jobTitle: job.title
    })

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    logger.error('Application creation API error', { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
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