import { JobsClient } from './jobs-client'
import { getJobs, getCompanies } from '@/lib/data/jobs'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage() {
  // Fetch data on server side where environment variables are available
  const jobs = await getJobs()
  const companies = await getCompanies()

  return <JobsClient initialJobs={jobs} initialCompanies={companies} />
}