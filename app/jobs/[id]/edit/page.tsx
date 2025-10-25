import { JobForm } from '@/components/forms/job-form'
import { getJob, getCompanies } from '@/lib/data/jobs'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditJobPage({ params }: PageProps) {
  const job = await getJob(params.id)
  const companies = await getCompanies()

  if (!job) {
    notFound()
  }

  return <JobForm job={job} companies={companies} />
}