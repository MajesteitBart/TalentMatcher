// app/api/jobs/index/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { indexingQueue } from '@/lib/queue/workflow-queue'
import { getActiveJobs } from '@/lib/supabase/queries/jobs'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import type { APIResponse } from '@/lib/types'

const IndexJobsSchema = z.object({
  company_id: z.string().uuid(),
  job_ids: z.array(z.string().uuid()).optional()
})

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = await request.json()
    const { company_id, job_ids } = IndexJobsSchema.parse(body)
    
    // Get jobs to index
    let jobsToIndex: string[]
    
    if (job_ids && job_ids.length > 0) {
      jobsToIndex = job_ids
    } else {
      // Index all active jobs for the company
      const activeJobs = await getActiveJobs(company_id)
      jobsToIndex = activeJobs.map(j => j.id)
    }
    
    if (jobsToIndex.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No jobs to index',
          count: 0
        }
      })
    }
    
    // Queue indexing job
    const job = await indexingQueue.add(
      'index-jobs',
      {
        jobIds: jobsToIndex,
        companyId: company_id
      },
      {
        priority: 2 // Lower priority than workflow jobs
      }
    )
    
    logger.info('Job indexing queued', {
      companyId: company_id,
      jobCount: jobsToIndex.length,
      jobId: job.id
    })
    
    return NextResponse.json({
      success: true,
      data: {
        message: `Indexing ${jobsToIndex.length} job(s)`,
        count: jobsToIndex.length,
        job_id: job.id
      }
    })
    
  } catch (error) {
    logger.error('Job indexing API error', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
