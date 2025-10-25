import { JobsClient } from './jobs-client'
import { getJobs, getCompanies } from '@/lib/data/jobs'

export default async function JobsPage() {
  // Fetch data on server side where environment variables are available
  const jobs = await getJobs()
  const companies = await getCompanies()

  return <JobsClient initialJobs={jobs} initialCompanies={companies} />
}