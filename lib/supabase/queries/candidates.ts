// lib/supabase/queries/candidates.ts
import { createAdminClient } from '../admin'
import type { Candidate, ParsedCV } from '@/lib/types'

export async function getCandidateById(candidateId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      parsed_cv:parsed_cvs(*)
    `)
    .eq('id', candidateId)
    .single()
  
  if (error) throw error
  return data
}

export async function createCandidate(
  candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .insert([candidate])
    .select()
    .single()
  
  if (error) throw error
  return data as Candidate
}

export async function saveParsedCV(parsedCV: Omit<ParsedCV, 'id' | 'parsed_at' | 'updated_at'>) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('parsed_cvs')
    .upsert([parsedCV], {
      onConflict: 'candidate_id'
    })
    .select()
    .single()
  
  if (error) throw error
  return data as ParsedCV
}
