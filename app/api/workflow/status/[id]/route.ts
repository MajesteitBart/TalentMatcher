// app/api/workflow/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowExecution } from '@/lib/supabase/queries/workflows'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse>> {
  try {
    const { id } = await params
    
    const execution = await getWorkflowExecution(id)
    
    if (!execution) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Workflow execution not found',
          code: 'NOT_FOUND'
        }
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: execution.id,
        status: execution.status,
        candidate: {
          id: execution.candidate.id,
          name: execution.candidate.name,
          email: execution.candidate.email
        },
        rejected_job: {
          id: execution.rejected_job.id,
          title: execution.rejected_job.title
        },
        match_count: execution.matched_job_ids?.length || 0,
        has_analysis: !!execution.final_analysis,
        duration_ms: execution.duration_ms,
        error: execution.error,
        created_at: execution.created_at,
        completed_at: execution.completed_at
      }
    })
    
  } catch (error) {
    const { id } = await params
    logger.error('Workflow status API error', { error, id })
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
