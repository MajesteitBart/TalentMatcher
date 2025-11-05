import { createAdminClient } from '@/lib/supabase/admin'
import type { CandidateWithApplications } from '@/lib/types/database'

export async function getCandidates(): Promise<CandidateWithApplications[]> {
  const supabase = createAdminClient()

  const { data: candidatesData, error: candidatesError } = await supabase
    .from('candidates')
    .select(`
      id,
      name,
      email,
      cv_text,
      cv_file_url,
      phone,
      linkedin_url,
      created_at,
      updated_at,
      applications (
        id,
        status,
        applied_at,
        rejected_at,
        rejection_reason,
        jobs (
          id,
          title,
          department,
          location,
          description
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (candidatesError) {
    console.error('Error fetching candidates:', candidatesError)
    return []
  }

  if (!candidatesData || candidatesData.length === 0) {
    console.log('No candidates found in database')
    return []
  }

  console.log(`Found ${candidatesData.length} candidates`)

  // Transform the data to match the expected type
  return candidatesData.map((candidate: any) => ({
    ...(candidate as any),
    applications: candidate.applications.map((app: any) => ({
      ...(app as any),
      job: app.jobs
    }))
  }))
}

export async function getCandidate(id: string): Promise<CandidateWithApplications | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id,
      name,
      email,
      cv_text,
      cv_file_url,
      phone,
      linkedin_url,
      created_at,
      updated_at,
      applications (
        id,
        status,
        applied_at,
        rejected_at,
        rejection_reason,
        workflow_executions(
          id,
          status,
          created_at,
          alternative_jobs: match_results(
            jobs (
              id,
              title,
              department,
              location,
              description
            ),
            composite_score,
            match_reasons
          )
        ),
        jobs (
          id,
          title,
          department,
          location,
          description
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching candidate:', error)
    return null
  }

  if (!data) return null

  // Transform the data to match the expected type
  return {
    ...(data as any),
    applications: (data as any).applications.map((app: any) => ({
      ...(app as any),
      job: app.jobs
    }))
  }
}