// lib/supabase/queries/workflows.ts
import { createAdminClient } from '../admin'
import type { WorkflowExecution, WorkflowState, MatchResultDB } from '@/lib/types'

export async function createWorkflowExecution(
  data: Pick<WorkflowExecution, 'candidate_id' | 'rejected_application_id' | 'rejected_job_id' | 'state'>
) {
  const supabase = createAdminClient()
  
  const { data: execution, error } = await (supabase
    .from('workflow_executions')
    .insert([{
      ...data,
      status: 'queued' as const
    }] as any)
    .select()
    .single() as any)
  
  if (error) throw error
  return execution as WorkflowExecution
}

export async function updateWorkflowExecution(
  id: string,
  updates: Partial<WorkflowExecution>
) {
  const supabase = createAdminClient()
  
  const { data, error } = await ((supabase
    .from('workflow_executions') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single())
  
  if (error) throw error
  return data as WorkflowExecution
}

export async function getWorkflowExecution(id: string) {
  const supabase = createAdminClient()

  console.log('Getting workflow execution with ID:', id)
  
  const { data, error } = await (supabase
    .from('workflow_executions')
    .select(`
      *,
      candidate:candidates(*),
      rejected_job:jobs(
        *,
        company:companies(*)
      ),
      match_results:match_results(
        *,
        job:jobs(
          *,
          company:companies(*)
        )
      )
    `) as any)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function saveMatchResults(
  workflowExecutionId: string,
  matches: Omit<MatchResultDB, 'id' | 'created_at' | 'workflow_execution_id'>[]
) {
  const supabase = createAdminClient()
  
  const { data, error } = await (supabase
    .from('match_results')
    .insert(
      matches.map(match => ({
        ...match,
        workflow_execution_id: workflowExecutionId
      })) as any
    )
    .select() as any)
  
  if (error) throw error
  return data as MatchResultDB[]
}
