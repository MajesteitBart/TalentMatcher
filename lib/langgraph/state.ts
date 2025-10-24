// lib/langgraph/state.ts
import { Annotation } from '@langchain/langgraph'
import type { WorkflowState, WorkflowStatus } from '@/lib/types'

/**
 * LangGraph state annotation
 * Defines how state updates are merged
 */
export const WorkflowStateAnnotation = Annotation.Root({
  // Input fields (set once)
  candidate_id: Annotation<string>,
  rejected_application_id: Annotation<string>,
  rejected_job_id: Annotation<string>,
  raw_cv: Annotation<string>,
  
  // Parsed data (updated by nodes)
  parsed_cv: Annotation<WorkflowState['parsed_cv']>,
  rejected_job_details: Annotation<WorkflowState['rejected_job_details']>,
  
  // Retrieval results (updated by parallel nodes)
  skills_matches: Annotation<WorkflowState['skills_matches']>,
  experience_matches: Annotation<WorkflowState['experience_matches']>,
  profile_matches: Annotation<WorkflowState['profile_matches']>,
  
  // Consolidated results
  consolidated_matches: Annotation<WorkflowState['consolidated_matches']>,
  
  // Final output
  final_analysis: Annotation<string>,
  
  // Metadata
  status: Annotation<WorkflowStatus>,
  error: Annotation<string | null>,
  current_node: Annotation<string | null>,
  attempt_count: Annotation<number>
})

/**
 * Initialize workflow state
 */
export function createInitialState(input: {
  candidate_id: string
  rejected_application_id: string
  rejected_job_id: string
  raw_cv: string
}): WorkflowState {
  return {
    ...input,
    parsed_cv: null,
    rejected_job_details: null,
    skills_matches: [],
    experience_matches: [],
    profile_matches: [],
    consolidated_matches: [],
    final_analysis: '',
    status: 'queued',
    error: null,
    current_node: null,
    attempt_count: 0
  }
}
