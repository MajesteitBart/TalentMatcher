import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters for filtering and sorting
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'applied_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build the query
    let query = supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        rejected_at,
        rejection_reason,
        candidate: candidate_id (
          id,
          name,
          email,
          phone,
          linkedin_url,
          cv_file_url,
          created_at,
          parsed_cv: parsed_cvs (
            summary,
            skills,
            work_experience,
            education,
            validation_status
          )
        )
      `)
      .eq('job_id', params.id)

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    const validSortFields = ['applied_at', 'name', 'status']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'applied_at'
    const sortDirection = sortOrder === 'asc' ? true : false

    if (sortField === 'name') {
      query = query.order('candidate(name)', { ascending: sortDirection })
    } else {
      query = query.order(sortField, { ascending: sortDirection })
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', params.id)
      .eq(status ? 'status' : 'job_id', status || params.id)

    if (countError) {
      logger.error('Error counting applications', { error: countError.message, jobId: params.id })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to count applications',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching job candidates', { error: error.message, jobId: params.id })
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to fetch candidates',
          code: 'DATABASE_ERROR'
        }
      }, { status: 500 })
    }

    // Transform the data to match our expected interface
    const candidates = data?.map((app: any) => ({
      ...app.candidate,
      application: {
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        rejected_at: app.rejected_at,
        rejection_reason: app.rejection_reason
      }
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page,
          per_page: limit,
          total: totalCount || 0,
          total_pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    logger.error('Job candidates API error', { error, jobId: params.id })
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}