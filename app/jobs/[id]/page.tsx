import { notFound } from 'next/navigation'
import { JobDetailClient } from './job-detail-client'
import { getJob } from '@/lib/data/jobs'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    id: string
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  return <JobDetailClient job={job} />
}

export async function generateMetadata({ params }: PageProps) {
  const job = await getJob(params.id)

  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The requested job could not be found.'
    }
  }

  return {
    title: `${job.title} - ${job.company?.name || 'Company'}`,
    description: job.description.substring(0, 160) + (job.description.length > 160 ? '...' : ''),
  }
}