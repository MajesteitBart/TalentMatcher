import WorkflowsClient from './workflows-client'
import { getWorkflowExecutions } from '@/lib/data/workflows'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'

export default async function WorkflowsPage() {
  // Fetch data on server side where environment variables are available
  const workflows = await getWorkflowExecutions()

  return <WorkflowsClient initialWorkflows={workflows} />
}