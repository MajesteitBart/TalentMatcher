// app/api/workflow/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowExecution } from '@/lib/supabase/queries/workflows'
import { logger } from '@/lib/utils/logger'
import type { APIResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse>> {
  try {
    const { id } = await params

    const execution = await getWorkflowExecution(id)

    console.log('Fetched workflow execution:', execution)

    if (!execution) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Workflow execution not found',
          code: 'NOT_FOUND'
        }
      }, { status: 404 })
    }


    // Enrich match results with full job details
    const enrichedMatchResults = execution.match_results?.map((match: any) => ({
      id: match.id,
      job: {
        id: match.job.id,
        title: match.job.title,
        description: match.job.description,
        department: match.job.department,
        location: match.job.location,
        job_type: match.job.job_type,
        experience_level: match.job.experience_level,
        required_skills: match.job.required_skills,
        company: match.job.company
      },
      similarity_score: match.similarity_score,
      composite_score: match.composite_score,
      match_source: match.match_source,
      hit_count: match.hit_count,
      match_reasons: match.match_reasons,
      rank: match.rank,
      created_at: match.created_at
    })) || []

    // Parse workflow state for timeline information
    const state = execution.state as any
    const timeline = {
      created_at: execution.created_at,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      current_stage: execution.status,
      parse_cv: state?.parse_cv_completed_at,
      retrieve_skills: state?.retrieve_skills_completed_at,
      retrieve_experience: state?.retrieve_experience_completed_at,
      retrieve_profile: state?.retrieve_profile_completed_at,
      consolidate: state?.consolidate_completed_at,
      analyze: state?.analyze_completed_at
    }

    return NextResponse.json({
      success: true,
      data: {
        id: execution.id,
        status: execution.status,
        candidate: {
          id: execution.candidate.id,
          name: execution.candidate.name,
          email: execution.candidate.email,
          phone: execution.candidate.phone,
          linkedin_url: execution.candidate.linkedin_url
        },
        rejected_job: {
          id: execution.rejected_job.id,
          title: execution.rejected_job.title,
          description: execution.rejected_job.description,
          department: execution.rejected_job.department,
          location: execution.rejected_job.location,
          job_type: execution.rejected_job.job_type,
          experience_level: execution.rejected_job.experience_level,
          company: execution.rejected_job.company
        },
        state: execution.state,
        final_analysis: execution.final_analysis,
        parsed_cv: state?.parsed_cv || null,
        consolidated_matches: state?.consolidated_matches || [],
        match_results: enrichedMatchResults,
        match_count: enrichedMatchResults.length,
        timeline: timeline,
        duration_ms: execution.duration_ms,
        error: execution.error,
        created_at: execution.created_at,
        started_at: execution.started_at,
        completed_at: execution.completed_at,
        updated_at: execution.updated_at
      }
    })

  } catch (error) {
    const { id } = await params
    logger.error('Workflow status API error', { error, id })

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}

