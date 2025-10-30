import { JobForm } from '@/components/forms/job-form'
import { getCompanies } from '@/lib/data/jobs'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewJobPage() {
  const companies = await getCompanies()

  return <JobForm companies={companies} />
}