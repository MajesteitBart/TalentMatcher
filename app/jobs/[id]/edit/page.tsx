import { JobForm } from '@/components/forms/job-form'
import { getJob, getCompanies } from '@/lib/data/jobs'
import { notFound } from 'next/navigation'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJob(id)
  const companies = await getCompanies()

  if (!job) {
    notFound()
  }

  return <JobForm job={job} companies={companies} />
}