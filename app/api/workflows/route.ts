import { NextResponse } from 'next/server'
import { getWorkflowExecutions } from '@/lib/data/workflows'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'

export async function GET() {
  try {
    const workflows = await getWorkflowExecutions()

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}