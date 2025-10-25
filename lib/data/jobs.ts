import { createAdminClient } from '@/lib/supabase/admin'
import type { JobWithCompany, Database } from '@/lib/types/database'

export async function getJobs(): Promise<JobWithCompany[]> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('jobs') as any)
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

  const { data, error } = await (supabase.from('jobs') as any)
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

  const { data, error } = await (supabase.from('companies') as any)
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data || []
}

export async function createJob(jobData: Database['public']['Tables']['jobs']['Insert']): Promise<JobWithCompany | null> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('jobs') as any)
    .insert(jobData)
    .select(`
      *,
      company: companies (
        id,
        name,
        domain
      )
    `)
    .single()

  if (error) {
    console.error('Error creating job:', error)
    return null
  }

  return data
}

export async function updateJob(id: string, jobData: Database['public']['Tables']['jobs']['Update']): Promise<JobWithCompany | null> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('jobs') as any)
    .update(jobData)
    .eq('id', id)
    .select(`
      *,
      company: companies (
        id,
        name,
        domain
      )
    `)
    .single()

  if (error) {
    console.error('Error updating job:', error)
    return null
  }

  return data
}

export async function deleteJob(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await (supabase.from('jobs') as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting job:', error)
    return false
  }

  return true
}