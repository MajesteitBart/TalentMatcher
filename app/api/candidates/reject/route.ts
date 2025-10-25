// app/api/candidates/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { workflowQueue } from '@/lib/queue/workflow-queue'
import { createWorkflowExecution } from '@/lib/supabase/queries/workflows'
import { createInitialState } from '@/lib/langgraph/state'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import type { APIResponse } from '@/lib/types'
import type { Database } from '@/lib/types/database'

const RejectCandidateSchema = z.object({
  candidate_id: z.string().uuid(),
  application_id: z.string().uuid(),
  rejection_reason: z.string().optional()
})

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const { candidate_id, application_id, rejection_reason } = RejectCandidateSchema.parse(body)
    
    const supabase = createAdminClient()
    
    // Get application details
    const { data: application, error: appError } = await (supabase
      .from('applications')
      .select('*, candidate:candidates(*), job:jobs(*)') as any)
      .eq('id', application_id)
      .single()
    
    if (appError || !application) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'NOT_FOUND'
        }
      }, { status: 404 })
    }
    
    // Update application status to rejected
    const { error: updateError } = await (supabase
      .from('applications') as any)
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null
      })
      .eq('id', application_id)
    
    if (updateError) {
      throw updateError
    }
    
    // Create workflow execution record
    const initialState = createInitialState({
      candidate_id,
      rejected_application_id: application_id,
      rejected_job_id: application.job_id,
      raw_cv: application.candidate.cv_text
    })
    
    const workflowExecution = await createWorkflowExecution({
      candidate_id,
      rejected_application_id: application_id,
      rejected_job_id: application.job_id,
      state: initialState
    })
    
    // Queue workflow execution
    const job = await workflowQueue.add(
      'match-candidate',
      {
        workflowExecutionId: workflowExecution.id,
        candidateId: candidate_id,
        rejectedApplicationId: application_id,
        rejectedJobId: application.job_id,
        cvText: application.candidate.cv_text
      },
      {
        jobId: workflowExecution.id, // Use execution ID as job ID for idempotency
        priority: 1
      }
    )
    
    logger.info('Candidate rejection workflow queued', {
      candidateId: candidate_id,
      applicationId: application_id,
      workflowExecutionId: workflowExecution.id,
      jobId: job.id
    })
    
    return NextResponse.json({
      success: true,
      data: {
        workflow_execution_id: workflowExecution.id,
        status: 'queued',
        message: 'Alternative job matching workflow has been queued'
      }
    })
    
  } catch (error) {
    logger.error('Candidate rejection API error', { error })
    
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
