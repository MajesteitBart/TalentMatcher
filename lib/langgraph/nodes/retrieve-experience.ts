// lib/langgraph/nodes/retrieve-experience.ts
import { generateEmbedding } from '@/lib/gemini/embeddings'
import { searchSimilarJobs } from '@/lib/vector/pgvector'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

export async function retrieveExperienceNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: retrieve-experience started', { 
    candidateId: state.candidate_id 
  })
  
  if (!state.parsed_cv) {
    return {
      error: 'No parsed CV available for experience retrieval'
    }
  }
  
  try {
    const experienceEmbedding = await generateEmbedding(state.parsed_cv.work_experience)
    
    const matches = await searchSimilarJobs(experienceEmbedding, 'experience', {
      matchThreshold: 0.72,
      matchCount: 10,
      excludeJobIds: [state.rejected_job_id]
    })
    
    logger.info('Experience-based matches found', {
      candidateId: state.candidate_id,
      matchCount: matches.length
    })
    
    return {
      experience_matches: matches,
      current_node: 'retrieve-experience'
    }
    
  } catch (error) {
    logger.error('Experience retrieval failed', { error })
    
    return {
      experience_matches: [],
      error: `Experience retrieval failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
