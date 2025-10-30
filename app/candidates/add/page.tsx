import { CandidateForm } from '@/components/forms/candidate-form'
import { getCompanies } from '@/lib/data/companies'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AddCandidatePage() {
  const companies = await getCompanies()

  return <CandidateForm companies={companies} />
}