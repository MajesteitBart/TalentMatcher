import { JobsClient } from './jobs-client'
import { getJobs, getCompanies } from '@/lib/data/jobs'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ candidate?: string }>
}) {
  // Fetch data on server side where environment variables are available
  const jobs = await getJobs()
  const companies = await getCompanies()
  const { candidate } = await searchParams

  return <JobsClient initialJobs={jobs} initialCompanies={companies} candidateId={candidate} />
}