import WorkflowsClient from './workflows-client'
import { getWorkflowExecutions } from '@/lib/data/workflows'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WorkflowsPage() {
  // Fetch data on server side where environment variables are available
  const workflows = await getWorkflowExecutions()

  return <WorkflowsClient initialWorkflows={workflows} />
}