import { createAdminClient } from '@/lib/supabase/admin'
import type { JobWithCompany } from '@/lib/types/database'

export async function getJobs(): Promise<JobWithCompany[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      required_skills,
      experience_level,
      department,
      location,
      job_type,
      status,
      created_at,
      updated_at,
      company: companies (
        id,
        name,
        domain
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return data || []
}

export async function getJob(id: string): Promise<JobWithCompany | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      required_skills,
      experience_level,
      department,
      location,
      job_type,
      status,
      created_at,
      updated_at,
      company: companies (
        id,
        name,
        domain
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    return null
  }

  return data
}

export async function getCompanies() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data || []
}