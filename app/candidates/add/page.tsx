import { CandidateForm } from '@/components/forms/candidate-form'
import { getCompanies } from '@/lib/data/companies'

export default async function AddCandidatePage() {
  const companies = await getCompanies()

  return <CandidateForm companies={companies} />
}