import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

const UpdateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').max(5000).optional(),
  required_skills: z.array(z.string().min(1)).max(20).optional(),
  experience_level: z.string().min(1, 'Experience level is required').optional(),
  department: z.string().max(100).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  status: z.enum(['active', 'closed', 'draft']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company: companies (
          id,
          name,
          domain
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Job not found',
            code: 'NOT_FOUND'
          }
        }, { status: 404 })
      }

      logger.error('Error fetching job', { error: error.message, jobId: params.id })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to fetch job',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    logger.error('Job fetch API error', { error, jobId: params.id })
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const validatedData = UpdateJobSchema.parse(body)

    const supabase = createAdminClient()

    const updateData: Record<string, any> = {}
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.required_skills !== undefined) updateData.required_skills = validatedData.required_skills
    if (validatedData.experience_level !== undefined) updateData.experience_level = validatedData.experience_level
    if (validatedData.department !== undefined) updateData.department = validatedData.department
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.job_type !== undefined) updateData.job_type = validatedData.job_type
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    const { data, error } = await (supabase.from('jobs') as any)
      .update(updateData)
      .eq('id', params.id)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Job not found',
            code: 'NOT_FOUND'
          }
        }, { status: 404 })
      }

      logger.error('Error updating job', { error: error.message, jobId: params.id, data: validatedData })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to update job',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    logger.info('Job updated successfully', { jobId: data.id, companyId: data.company_id })

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    logger.error('Job update API error', { error, jobId: params.id })

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const supabase = createAdminClient()

    // First check if job has any applications
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', params.id)
      .limit(1)

    if (appError) {
      logger.error('Error checking job applications', { error: appError.message, jobId: params.id })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to check job dependencies',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    if (applications && applications.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Cannot delete job with existing applications',
          code: 'HAS_DEPENDENCIES'
        }
      }, { status: 400 })
    }

    // Delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Job not found',
            code: 'NOT_FOUND'
          }
        }, { status: 404 })
      }

      logger.error('Error deleting job', { error: error.message, jobId: params.id })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to delete job',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    logger.info('Job deleted successfully', { jobId: params.id })

    return NextResponse.json({
      success: true,
      data: { message: 'Job deleted successfully' }
    })

  } catch (error) {
    logger.error('Job deletion API error', { error, jobId: params.id })
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}