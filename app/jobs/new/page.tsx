import { JobForm } from '@/components/forms/job-form'
import { getCompanies } from '@/lib/data/jobs'

export default async function NewJobPage() {
  const companies = await getCompanies()

  return <JobForm companies={companies} />
}