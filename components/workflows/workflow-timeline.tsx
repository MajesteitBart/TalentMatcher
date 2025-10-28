'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface WorkflowTimelineProps {
  workflow: any
}

interface TimelineStep {
  key: string
  label: string
  status: 'completed' | 'in_progress' | 'pending' | 'error'
  timestamp?: string | null
  description?: string
}

export function WorkflowTimeline({ workflow }: WorkflowTimelineProps) {
  const getStepStatus = (timestamp: string | null | undefined, isError: boolean = false): TimelineStep['status'] => {
    if (isError) return 'error'
    if (timestamp) return 'completed'
    if (workflow.status === 'failed' || workflow.status === 'completed') return 'pending'
    return 'in_progress'
  }

  const getStepIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStepColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-600'
    }
  }

  const hasErrorInStep = (stepKey: string): boolean => {
    return workflow.error &&
           workflow.status === 'failed' &&
           getStepStatus(workflow.timeline?.[stepKey]) === 'pending'
  }

  const timelineSteps: TimelineStep[] = [
    {
      key: 'created_at',
      label: 'Workflow Created',
      status: 'completed',
      timestamp: workflow.created_at,
      description: 'Workflow execution initialized and queued'
    },
    {
      key: 'started_at',
      label: 'Processing Started',
      status: workflow.started_at ? 'completed' : (workflow.status === 'failed' ? 'pending' : 'in_progress'),
      timestamp: workflow.started_at,
      description: 'Workflow processing began'
    },
    {
      key: 'parse_cv',
      label: 'CV Parsing',
      status: getStepStatus(workflow.timeline?.parse_cv, hasErrorInStep('parse_cv')),
      timestamp: workflow.timeline?.parse_cv,
      description: 'Extracting structured data from candidate CV using AI'
    },
    {
      key: 'retrieve_skills',
      label: 'Skills Search',
      status: getStepStatus(workflow.timeline?.retrieve_skills, hasErrorInStep('retrieve_skills')),
      timestamp: workflow.timeline?.retrieve_skills,
      description: 'Searching for jobs matching candidate skills (40% weight)'
    },
    {
      key: 'retrieve_experience',
      label: 'Experience Search',
      status: getStepStatus(workflow.timeline?.retrieve_experience, hasErrorInStep('retrieve_experience')),
      timestamp: workflow.timeline?.retrieve_experience,
      description: 'Searching for jobs matching candidate experience (35% weight)'
    },
    {
      key: 'retrieve_profile',
      label: 'Profile Search',
      status: getStepStatus(workflow.timeline?.retrieve_profile, hasErrorInStep('retrieve_profile')),
      timestamp: workflow.timeline?.retrieve_profile,
      description: 'Searching for jobs matching overall candidate profile (25% weight)'
    },
    {
      key: 'consolidate',
      label: 'Result Consolidation',
      status: getStepStatus(workflow.timeline?.consolidate, hasErrorInStep('consolidate')),
      timestamp: workflow.timeline?.consolidate,
      description: 'Merging and ranking search results from all sources'
    },
    {
      key: 'analyze',
      label: 'AI Analysis',
      status: getStepStatus(workflow.timeline?.analyze, hasErrorInStep('analyze')),
      timestamp: workflow.timeline?.analyze,
      description: 'Generating detailed analysis and recommendations'
    },
    {
      key: 'completed_at',
      label: 'Completed',
      status: workflow.completed_at ? 'completed' : (workflow.status === 'failed' ? 'error' : 'in_progress'),
      timestamp: workflow.completed_at,
      description: workflow.status === 'completed' ? 'Workflow completed successfully' :
                  workflow.status === 'failed' ? 'Workflow failed with error' : 'Workflow in progress'
    }
  ]

  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return null
    try {
      const date = new Date(timestamp)
      return (
        <div className="text-xs text-gray-500">
          <div>{format(date, 'MMM d, yyyy HH:mm:ss')}</div>
          <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
        </div>
      )
    } catch {
      return <div className="text-xs text-gray-500">Invalid date</div>
    }
  }

  const getStepDuration = (stepKey: string) => {
    const timeline = workflow.timeline
    if (!timeline) return null

    let start, end
    switch (stepKey) {
      case 'created_at':
        start = timeline.created_at
        end = timeline.started_at
        break
      case 'parse_cv':
        start = timeline.started_at
        end = timeline.parse_cv
        break
      case 'retrieve_skills':
        start = timeline.parse_cv
        end = timeline.retrieve_skills
        break
      case 'retrieve_experience':
        start = timeline.parse_cv
        end = timeline.retrieve_experience
        break
      case 'retrieve_profile':
        start = timeline.parse_cv
        end = timeline.retrieve_profile
        break
      case 'consolidate':
        start = Math.max(
          timeline.retrieve_skills || 0,
          timeline.retrieve_experience || 0,
          timeline.retrieve_profile || 0
        )
        end = timeline.consolidate
        break
      case 'analyze':
        start = timeline.consolidate
        end = timeline.analyze
        break
      case 'completed_at':
        start = timeline.analyze
        end = timeline.completed_at
        break
    }

    if (start && end) {
      try {
        const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
        if (duration < 60) return `${duration}s`
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        return `${minutes}m ${seconds}s`
      } catch {
        return null
      }
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => (
            <div key={step.key} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
                  {getStepIcon(step.status)}
                </div>
                {index < timelineSteps.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                )}
              </div>

              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{step.label}</h4>
                    {step.description && (
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getStepColor(step.status)}>
                      {step.status}
                    </Badge>
                    {formatTimestamp(step.timestamp)}
                    {getStepDuration(step.key) && (
                      <span className="text-xs text-gray-500">
                        Duration: {getStepDuration(step.key)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(workflow.duration_ms)}
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {workflow.match_count}
              </div>
              <div className="text-sm text-gray-600">Matches Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {workflow.parsed_cv ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">CV Parsed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {workflow.final_analysis ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Analysis Complete</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) return 'N/A'
  const seconds = Math.floor(durationMs / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}