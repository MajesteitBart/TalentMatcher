import { SettingsClient } from './settings-client'
import { getCompanies } from '@/lib/data/companies'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  // Get all companies for multi-company management
  const companies = await getCompanies()

  // Default to first company if available, otherwise null
  const initialCompany = companies[0] || null

  return <SettingsClient initialCompanies={companies} initialCompany={initialCompany} />
}