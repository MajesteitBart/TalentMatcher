import { createAdminClient } from '@/lib/supabase/admin'
import type { CandidateWithApplications } from '@/lib/types/database'

export async function getCandidates(): Promise<CandidateWithApplications[]> {
  const supabase = createAdminClient()

  // First try basic candidate query
  const { data: candidatesData, error: candidatesError } = await supabase
    .from('candidates')
    .select(`
      id,
      name,
      email,
      cv_text,
      created_at,
      updated_at
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

  // For now, return candidates with empty applications array
  // TODO: Fix the applications join later
  return candidatesData.map((candidate): CandidateWithApplications => ({
    ...candidate,
    applications: []
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
        job: jobs (
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

  return data
}