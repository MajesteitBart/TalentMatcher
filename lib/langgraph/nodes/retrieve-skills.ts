// lib/langgraph/nodes/retrieve-skills.ts
import { generateEmbedding } from '@/lib/gemini/embeddings'
import { searchSimilarJobs } from '@/lib/vector/pgvector'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

export async function retrieveSkillsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: retrieve-skills started', { 
    candidateId: state.candidate_id 
  })
  
  if (!state.parsed_cv) {
    logger.error('No parsed CV available')
    return {
      error: 'No parsed CV available for skills retrieval'
    }
  }
  
  try {
    // Generate embedding for skills
    const skillsEmbedding = await generateEmbedding(state.parsed_cv.skills)
    
    // Search similar jobs
    const matches = await searchSimilarJobs(skillsEmbedding, 'skills', {
      matchThreshold: 0.72,
      matchCount: 10,
      excludeJobIds: [state.rejected_job_id] // Don't match the rejected job
    })
    
    logger.info('Skills-based matches found', {
      candidateId: state.candidate_id,
      matchCount: matches.length
    })
    
    return {
      skills_matches: matches
    }
    
  } catch (error) {
    logger.error('Skills retrieval failed', { error })
    
    return {
      skills_matches: [], // Graceful degradation
      error: `Skills retrieval failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
