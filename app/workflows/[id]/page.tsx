import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { WorkflowDetail } from '@/components/workflows/workflow-detail'
import { notFound } from 'next/navigation'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface WorkflowDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkflowDetailPage({
  params,
}: WorkflowDetailPageProps) {
  const { id } = await params

  // Fetch workflow data from API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/workflow/status/${id}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  console.log('Fetch response status:', response.status)
  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch workflow details')
  }

  const workflowData = await response.json()

  if (!workflowData.success) {
    throw new Error(workflowData.error?.message || 'Failed to load workflow')
  } 

  return (
    <LayoutWrapper>
      <WorkflowDetail workflow={workflowData.data} />
    </LayoutWrapper>
  )
}