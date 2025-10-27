'use client'

import { useState } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WorkflowExecutionWithDetails } from '@/lib/types/database'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { RefreshCw, Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface WorkflowsClientProps {
  initialWorkflows: WorkflowExecutionWithDetails[]
}

export default function WorkflowsClient({ initialWorkflows }: WorkflowsClientProps) {
  const [workflows, setWorkflows] = useState<WorkflowExecutionWithDetails[]>(initialWorkflows)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workflows')
      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }
      const workflowData = await response.json()
      setWorkflows(workflowData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'queued':
      case 'parsing':
      case 'retrieving':
      case 'consolidating':
      case 'analyzing':
        return <Activity className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'queued':
      case 'parsing':
      case 'retrieving':
      case 'consolidating':
      case 'analyzing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return 'N/A'
    const seconds = Math.floor(durationMs / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Workflow Executions</h1>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <Button onClick={loadWorkflows} disabled={loading} className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {workflows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No workflow executions yet
              </h3>
              <p className="text-gray-600">
                Workflow executions will appear here when candidates are rejected and the AI matching process begins.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {getStatusIcon(workflow.status)}
                        <span>{workflow.candidate?.name || 'Unknown Candidate'}</span>
                      </CardTitle>
                      <p className="text-gray-600">{workflow.candidate?.email || 'No email available'}</p>
                      <p className="text-sm text-gray-500">
                        Rejected from: {workflow.rejected_job?.title || 'Unknown Position'} at {workflow.rejected_job?.department || 'Unknown Department'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          workflow.status
                        )}`}
                      >
                        {workflow.status}
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/workflows/${workflow.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflow.match_results && workflow.match_results.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Match Results ({workflow.match_results.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {workflow.match_results.slice(0, 3).map((match) => (
                            <div
                              key={match.id}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <p className="font-medium text-sm text-gray-900">
                                {match.job.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {match.job.company?.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-medium text-blue-600">
                                  Score: {Math.round(match.composite_score * 100)}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {match.match_source}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {workflow.match_results.length > 3 && (
                          <p className="text-sm text-gray-600 mt-2">
                            +{workflow.match_results.length - 3} more matches
                          </p>
                        )}
                      </div>
                    )}

                    {workflow.error && (
                      <div>
                        <h4 className="text-sm font-medium text-red-900 mb-1">
                          Error
                        </h4>
                        <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
                          {workflow.error}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {formatDuration(workflow.duration_ms)}</span>
                        </div>
                        <span>
                          Started {formatDistanceToNow(new Date(workflow.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {workflow.final_analysis && (
                        <span className="text-green-600 font-medium">
                          Analysis Complete
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}