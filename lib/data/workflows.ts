import { createAdminClient } from '@/lib/supabase/admin'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'

export async function getWorkflowExecutions(): Promise<WorkflowExecutionWithDetails[]> {
  const supabase = createAdminClient()

  // First try basic workflow execution query
  const { data: workflowsData, error: workflowsError } = await supabase
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
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (workflowsError) {
    console.error('Error fetching workflow executions:', workflowsError)
    return []
  }

  if (!workflowsData || workflowsData.length === 0) {
    console.log('No workflow executions found in database')
    return []
  }

  console.log(`Found ${workflowsData.length} workflow executions`)

  // Fetch basic candidate and job information separately
  const candidateIds = Array.from(new Set(workflowsData.map((w: any) => w.candidate_id)))
  const jobIds = Array.from(new Set(workflowsData.map((w: any) => w.rejected_job_id)))

  const { data: candidatesData } = await supabase
    .from('candidates')
    .select('id, name, email')
    .in('id', candidateIds)

  const { data: jobsData } = await supabase
    .from('jobs')
    .select('id, title, department')
    .in('id', jobIds)

  // Combine the data
  return workflowsData.map((workflow: any) => ({
    ...workflow,
    candidate: candidatesData?.find((c: any) => c.id === workflow.candidate_id) || null,
    rejected_job: jobsData?.find((j: any) => j.id === workflow.rejected_job_id) || null
  }))
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