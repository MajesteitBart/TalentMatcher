// lib/supabase/queries/jobs.ts
import { createAdminClient } from '../admin'
import type { Job, JobEmbedding } from '@/lib/types'

export async function getActiveJobs(companyId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Job[]
}

export async function getJobById(jobId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  
  if (error) throw error
  return data as Job
}

export async function getJobsWithEmbeddings(jobIds: string[]) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      embeddings:job_embeddings(*)
    `)
    .in('id', jobIds)
  
  if (error) throw error
  return data
}

export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single()
  
  if (error) throw error
  return data as Job
}
