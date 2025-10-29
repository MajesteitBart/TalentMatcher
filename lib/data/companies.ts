import { createAdminClient } from '@/lib/supabase/admin'

export async function getCompanies() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data || []
}

export async function getCompany(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return null
  }

  return data
}

export async function createCompany(companyData: { name: string; domain?: string | null }) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: companyData.name,
      domain: companyData.domain || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating company:', error)
    throw new Error(error.message)
  }

  return data
}