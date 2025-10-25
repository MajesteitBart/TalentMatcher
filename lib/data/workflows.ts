import { createAdminClient } from '@/lib/supabase/admin'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'

export async function getWorkflowExecutions(): Promise<WorkflowExecutionWithDetails[]> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase
    .from('workflow_executions')
    .select(`
      id,
      candidate_id,
      rejected_application_id,
      rejected_job_id,
      status,
      state,
      final_analysis,
      matched_job_ids,
      error,
      duration_ms,
      created_at,
      started_at,
      completed_at,
      updated_at,
      candidate: candidates (
        id,
        name,
        email
      ),
      rejected_job: jobs (
        id,
        title,
        department
      ),
      match_results: match_results (
        id,
        job_id,
        similarity_score,
        composite_score,
        match_source,
        job: jobs (
          id,
          title,
          department,
          company: companies (
            name
          )
        )
      )
    `) as any)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workflow executions:', error)
    return []
  }

  return data || []
}

export async function getWorkflowExecution(id: string): Promise<WorkflowExecutionWithDetails | null> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase
    .from('workflow_executions')
    .select(`
      id,
      candidate_id,
      rejected_application_id,
      rejected_job_id,
      status,
      state,
      final_analysis,
      matched_job_ids,
      error,
      duration_ms,
      created_at,
      started_at,
      completed_at,
      updated_at,
      candidate: candidates (
        id,
        name,
        email
      ),
      rejected_job: jobs (
        id,
        title,
        department,
        description,
        company: companies (
          name
        )
      ),
      match_results: match_results (
        id,
        job_id,
        similarity_score,
        composite_score,
        match_source,
        match_reasons,
        rank,
        job: jobs (
          id,
          title,
          department,
          company: companies (
            name
          )
        )
      )
    `) as any)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching workflow execution:', error)
    return null
  }

  return data
}