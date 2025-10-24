// lib/langgraph/nodes/consolidate.ts
import { logger } from '@/lib/utils/logger'
import type { WorkflowState, ConsolidatedMatch, MatchResult } from '@/lib/types'

/**
 * Weighted scoring configuration
 */
const WEIGHTS = {
  skills: 0.40,      // Skills match is most important
  experience: 0.35,  // Experience is very important
  profile: 0.25      // Full profile catches edge cases
} as const

export async function consolidateNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: consolidate started', {
    candidateId: state.candidate_id,
    skillsMatches: state.skills_matches.length,
    experienceMatches: state.experience_matches.length,
    profileMatches: state.profile_matches.length
  })
  
  try {
    // Collect all matches by job_id
    const jobMatchMap = new Map<string, {
      job_id: string
      job_title: string
      job_description: string
      sources: Array<{
        source: 'skills' | 'experience' | 'profile'
        score: number
      }>
    }>()
    
    // Process skills matches
    state.skills_matches.forEach(match => {
      if (!jobMatchMap.has(match.job_id)) {
        jobMatchMap.set(match.job_id, {
          job_id: match.job_id,
          job_title: match.job_title,
          job_description: match.job_description,
          sources: []
        })
      }
      jobMatchMap.get(match.job_id)!.sources.push({
        source: 'skills',
        score: match.similarity_score
      })
    })
    
    // Process experience matches
    state.experience_matches.forEach(match => {
      if (!jobMatchMap.has(match.job_id)) {
        jobMatchMap.set(match.job_id, {
          job_id: match.job_id,
          job_title: match.job_title,
          job_description: match.job_description,
          sources: []
        })
      }
      jobMatchMap.get(match.job_id)!.sources.push({
        source: 'experience',
        score: match.similarity_score
      })
    })
    
    // Process profile matches
    state.profile_matches.forEach(match => {
      if (!jobMatchMap.has(match.job_id)) {
        jobMatchMap.set(match.job_id, {
          job_id: match.job_id,
          job_title: match.job_title,
          job_description: match.job_description,
          sources: []
        })
      }
      jobMatchMap.get(match.job_id)!.sources.push({
        source: 'profile',
        score: match.similarity_score
      })
    })
    
    // Calculate composite scores
    const consolidatedMatches: ConsolidatedMatch[] = Array.from(jobMatchMap.values())
      .map(job => {
        const sourceScores: Record<string, number> = {}
        let weightedSum = 0
        let totalWeight = 0
        
        job.sources.forEach(({ source, score }) => {
          sourceScores[source] = score
          const weight = WEIGHTS[source]
          weightedSum += score * weight
          totalWeight += weight
        })
        
        // Normalize by actual weights used (in case not all sources matched)
        const composite_score = totalWeight > 0 ? weightedSum / totalWeight : 0
        
        // Boost score for multi-source matches
        const hitCount = job.sources.length
        const boostFactor = 1 + (hitCount - 1) * 0.05 // 5% boost per additional source
        const boostedScore = Math.min(composite_score * boostFactor, 1.0)
        
        return {
          job_id: job.job_id,
          job_title: job.job_title,
          job_description: job.job_description,
          composite_score: boostedScore,
          hit_count: hitCount,
          source_scores: sourceScores,
          rank: 0 // Will be set after sorting
        }
      })
      .sort((a, b) => {
        // Sort by composite score (descending), then by hit count (descending)
        if (b.composite_score !== a.composite_score) {
          return b.composite_score - a.composite_score
        }
        return b.hit_count - a.hit_count
      })
      .slice(0, 10) // Keep top 10
      .map((match, index) => ({
        ...match,
        rank: index + 1
      }))
    
    logger.info('Match consolidation completed', {
      candidateId: state.candidate_id,
      totalUniqueJobs: jobMatchMap.size,
      topMatchesCount: consolidatedMatches.length,
      topScore: consolidatedMatches[0]?.composite_score
    })
    
    return {
      consolidated_matches: consolidatedMatches,
      status: 'consolidating',
      current_node: 'consolidate'
    }
    
  } catch (error) {
    logger.error('Match consolidation failed', { error })
    
    return {
      status: 'failed',
      error: `Match consolidation failed: ${error instanceof Error ? error.message : String(error)}`,
      current_node: 'consolidate'
    }
  }
}
