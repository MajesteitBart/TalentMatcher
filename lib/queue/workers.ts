// lib/queue/workers.ts
import { Worker, Job } from 'bullmq'
import { redisConnection } from './workflow-queue'
import { executeWorkflow } from '@/lib/langgraph/graph'
import { createInitialState } from '@/lib/langgraph/state'
import { updateWorkflowExecution, saveMatchResults } from '@/lib/supabase/queries/workflows'
import { getCandidateById } from '@/lib/supabase/queries/candidates'
import { generateJobEmbeddings } from '@/lib/gemini/embeddings'
import { storeJobEmbeddings } from '@/lib/vector/pgvector'
import { getActiveJobs } from '@/lib/supabase/queries/jobs'
import { logger } from '@/lib/utils/logger'
import type { WorkflowJobData, IndexingJobData } from '@/lib/types'

/**
 * Workflow execution worker
 */
export const workflowWorker = new Worker(
  'talent-matcher-workflow',
  async (job: Job<WorkflowJobData>) => {
    const { workflowExecutionId, candidateId, rejectedApplicationId, rejectedJobId, cvText } = job.data
    
    logger.info('Processing workflow job', {
      jobId: job.id,
      workflowExecutionId,
      candidateId
    })
    
    const startTime = Date.now()
    
    try {
      // Update workflow status to 'parsing'
      await updateWorkflowExecution(workflowExecutionId, {
        status: 'parsing',
        started_at: new Date().toISOString()
      })
      
      // Create initial state
      const initialState = createInitialState({
        candidate_id: candidateId,
        rejected_application_id: rejectedApplicationId,
        rejected_job_id: rejectedJobId,
        raw_cv: cvText
      })
      
      // Execute workflow
      const result = await executeWorkflow(initialState)
      
      const duration = Date.now() - startTime
      
      // Save results to database
      await updateWorkflowExecution(workflowExecutionId, {
        status: result.status,
        state: result as any,
        final_analysis: result.final_analysis || null,
        matched_job_ids: result.consolidated_matches.map(m => m.job_id),
        error: result.error,
        duration_ms: duration,
        completed_at: new Date().toISOString()
      })
      
      // Save match results
      if (result.consolidated_matches.length > 0) {
        await saveMatchResults(
          workflowExecutionId,
          result.consolidated_matches.map(match => ({
            job_id: match.job_id,
            similarity_score: Object.values(match.source_scores)[0] || 0,
            composite_score: match.composite_score,
            match_source: Object.keys(match.source_scores)[0] as any || 'profile',
            hit_count: match.hit_count,
            match_reasons: match.source_scores as any,
            rank: match.rank
          }))
        )
      }
      
      logger.info('Workflow job completed', {
        jobId: job.id,
        workflowExecutionId,
        status: result.status,
        duration,
        matchCount: result.consolidated_matches.length
      })
      
      return {
        success: true,
        workflowExecutionId,
        matchCount: result.consolidated_matches.length,
        duration
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error('Workflow job failed', {
        jobId: job.id,
        workflowExecutionId,
        error,
        duration
      })
      
      // Update workflow status to failed
      await updateWorkflowExecution(workflowExecutionId, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        duration_ms: duration,
        completed_at: new Date().toISOString()
      })
      
      throw error
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Process 2 workflows concurrently
    limiter: {
      max: 10, // Max 10 jobs per...
      duration: 60000 // ...60 seconds (rate limiting)
    }
  }
)

/**
 * Job indexing worker
 */
export const indexingWorker = new Worker(
  'talent-matcher-indexing',
  async (job: Job<IndexingJobData>) => {
    const { jobIds, companyId } = job.data
    
    logger.info('Processing indexing job', {
      jobId: job.id,
      jobCount: jobIds.length,
      companyId
    })
    
    try {
      // Get jobs to index
      const jobs = await getActiveJobs(companyId)
      const jobsToIndex = jobs.filter(j => jobIds.includes(j.id))
      
      let indexed = 0
      
      for (const jobToIndex of jobsToIndex) {
        try {
          // Generate embeddings
          const embeddings = await generateJobEmbeddings(jobToIndex)
          
          // Store in pgvector
          await storeJobEmbeddings(jobToIndex.id, embeddings)
          
          indexed++
          
          // Update progress
          await job.updateProgress((indexed / jobsToIndex.length) * 100)
          
          logger.info('Job indexed successfully', {
            jobId: jobToIndex.id,
            progress: `${indexed}/${jobsToIndex.length}`
          })
          
        } catch (error) {
          logger.error('Failed to index job', {
            jobId: jobToIndex.id,
            error
          })
          // Continue with other jobs
        }
      }
      
      logger.info('Indexing job completed', {
        jobId: job.id,
        indexed,
        total: jobsToIndex.length
      })
      
      return {
        success: true,
        indexed,
        total: jobsToIndex.length
      }
      
    } catch (error) {
      logger.error('Indexing job failed', {
        jobId: job.id,
        error
      })
      
      throw error
    }
  },
  {
    connection: redisConnection,
    concurrency: 1 // Process one indexing job at a time
  }
)

// Worker event handlers
workflowWorker.on('completed', (job) => {
  logger.info('Workflow worker: Job completed', { jobId: job.id })
})

workflowWorker.on('failed', (job, error) => {
  logger.error('Workflow worker: Job failed', { 
    jobId: job?.id, 
    error: error.message 
  })
})

indexingWorker.on('completed', (job) => {
  logger.info('Indexing worker: Job completed', { jobId: job.id })
})

indexingWorker.on('failed', (job, error) => {
  logger.error('Indexing worker: Job failed', { 
    jobId: job?.id, 
    error: error.message 
  })
})
