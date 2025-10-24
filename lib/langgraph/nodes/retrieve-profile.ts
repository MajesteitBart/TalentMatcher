// lib/langgraph/nodes/retrieve-profile.ts
import { generateEmbedding } from '@/lib/gemini/embeddings'
import { searchSimilarJobs } from '@/lib/vector/pgvector'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

export async function retrieveProfileNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: retrieve-profile started', { 
    candidateId: state.candidate_id 
  })
  
  if (!state.parsed_cv) {
    return {
      error: 'No parsed CV available for profile retrieval'
    }
  }
  
  try {
    // Combine summary, skills, and experience for full profile
    const fullProfile = `${state.parsed_cv.summary}\n\nSkills: ${state.parsed_cv.skills}\n\nExperience: ${state.parsed_cv.work_experience}`
    
    const profileEmbedding = await generateEmbedding(fullProfile)
    
    const matches = await searchSimilarJobs(profileEmbedding, 'full', {
      matchThreshold: 0.72,
      matchCount: 10,
      excludeJobIds: [state.rejected_job_id]
    })
    
    logger.info('Profile-based matches found', {
      candidateId: state.candidate_id,
      matchCount: matches.length
    })
    
    return {
      profile_matches: matches,
      current_node: 'retrieve-profile'
    }
    
  } catch (error) {
    logger.error('Profile retrieval failed', { error })
    
    return {
      profile_matches: [],
      error: `Profile retrieval failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
