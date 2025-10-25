// lib/langgraph/nodes/analyze.ts
import { analyzeMatches } from '@/lib/gemini/analyzer'
import { getJobsWithEmbeddings } from '@/lib/supabase/queries/jobs'
import { getCandidateById } from '@/lib/supabase/queries/candidates'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

export async function analyzeNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: analyze started', {
    candidateId: state.candidate_id,
    matchCount: state.consolidated_matches.length
  })
  
  if (!state.parsed_cv || state.consolidated_matches.length === 0) {
    logger.warn('No matches to analyze', { candidateId: state.candidate_id })
    
    return {
      final_analysis: 'No suitable alternative positions were found for this candidate.',
      status: 'completed',
      current_node: 'analyze'
    }
  }
  
  try {
    // Get candidate details
    const candidate = await getCandidateById(state.candidate_id)
    
    // Get full job details for top matches
    const topMatchJobIds = state.consolidated_matches.slice(0, 5).map(m => m.job_id)
    const matchedJobsData = await getJobsWithEmbeddings(topMatchJobIds)
    
    // Get rejected job details (if not already in state)
    if (!state.rejected_job_details) {
      const rejectedJobData = await getJobsWithEmbeddings([state.rejected_job_id])
      state.rejected_job_details = rejectedJobData[0] as any
    }
    
    // Generate analysis with Gemini
    const analysis = await analyzeMatches(
      (candidate as any).name,
      state.parsed_cv,
      state.rejected_job_details as any,
      state.consolidated_matches.slice(0, 5),
      matchedJobsData as any[]
    )
    
    logger.info('Match analysis completed', {
      candidateId: state.candidate_id,
      analysisLength: analysis.markdown.length,
      recommendationCount: analysis.recommendations.length
    })
    
    return {
      final_analysis: analysis.markdown,
      status: 'completed',
      current_node: 'analyze'
    }
    
  } catch (error) {
    logger.error('Match analysis failed', { error })
    
    return {
      status: 'failed',
      error: `Match analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      current_node: 'analyze'
    }
  }
}
