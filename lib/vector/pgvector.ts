// lib/vector/pgvector.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'
import type { JobEmbedding, MatchResult } from '@/lib/types'

/**
 * Store job embeddings in pgvector
 */
export async function storeJobEmbeddings(
  jobId: string,
  embeddings: {
    full: number[]
    skills: number[]
    experience: number[]
  }
) {
  const supabase = createAdminClient()
  
  const embeddingRecords: Omit<JobEmbedding, 'id' | 'created_at'>[] = [
    {
      job_id: jobId,
      embedding: embeddings.full,
      embedding_type: 'full',
      model_version: 'text-embedding-004'
    },
    {
      job_id: jobId,
      embedding: embeddings.skills,
      embedding_type: 'skills',
      model_version: 'text-embedding-004'
    },
    {
      job_id: jobId,
      embedding: embeddings.experience,
      embedding_type: 'experience',
      model_version: 'text-embedding-004'
    }
  ]
  
  const { data, error } = await (supabase
    .from('job_embeddings')
    .upsert(embeddingRecords as any, {
      onConflict: 'job_id,embedding_type'
    })
    .select() as any)
  
  if (error) {
    logger.error('Failed to store job embeddings', { error, jobId })
    throw error
  }
  
  logger.info('Job embeddings stored successfully', { jobId })
  return data
}

/**
 * Search for similar jobs using pgvector
 */
export async function searchSimilarJobs(
  queryEmbedding: number[],
  embeddingType: 'full' | 'skills' | 'experience',
  options: {
    matchThreshold?: number
    matchCount?: number
    excludeJobIds?: string[]
  } = {}
): Promise<MatchResult[]> {
  const {
    matchThreshold = 0.7,
    matchCount = 10,
    excludeJobIds = []
  } = options
  
  const supabase = createAdminClient()
  
  try {
    // Use the RPC function we created in the schema
    const { data, error } = await ((supabase as any).rpc('match_jobs', {
        query_embedding: queryEmbedding, // pgvector type
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_type: embeddingType
      }))
    
    if (error) throw error
    
    // Filter out excluded jobs
    let results = data || []
    if (excludeJobIds.length > 0) {
      results = results.filter((r: any) => !excludeJobIds.includes(r.job_id))
    }
    
    // Map to MatchResult type
    const matches: MatchResult[] = results.map((row: any) => ({
      job_id: row.job_id,
      job_title: row.job_title,
      job_description: row.job_description,
      similarity_score: row.similarity,
      match_source: embeddingType
    }))
    
    logger.info('Similar jobs search completed', {
      embeddingType,
      foundCount: matches.length,
      threshold: matchThreshold
    })
    
    return matches
    
  } catch (error) {
    logger.error('Similar jobs search failed', { error, embeddingType })
    throw new Error(`Vector search failed: ${error}`)
  }
}

/**
 * Batch search across all embedding types
 */
export async function batchSearchSimilarJobs(
  embeddings: {
    skills: number[]
    experience: number[]
    full: number[]
  },
  options: {
    matchThreshold?: number
    matchCount?: number
    excludeJobIds?: string[]
  } = {}
): Promise<{
  skills: MatchResult[]
  experience: MatchResult[]
  profile: MatchResult[]
}> {
  const [skills, experience, profile] = await Promise.all([
    searchSimilarJobs(embeddings.skills, 'skills', options),
    searchSimilarJobs(embeddings.experience, 'experience', options),
    searchSimilarJobs(embeddings.full, 'full', options)
  ])
  
  return { skills, experience, profile }
}

/**
 * Delete job embeddings (when job is deleted/closed)
 */
export async function deleteJobEmbeddings(jobId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('job_embeddings')
    .delete()
    .eq('job_id', jobId)
  
  if (error) {
    logger.error('Failed to delete job embeddings', { error, jobId })
    throw error
  }
  
  logger.info('Job embeddings deleted', { jobId })
}
