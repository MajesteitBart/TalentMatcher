'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkflowTimeline } from './workflow-timeline'
import { MatchResultsTable } from './match-results-table'
import { WorkflowStateDisplay } from './workflow-state-display'
import {
  ArrowLeft,
  User,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface WorkflowDetailProps {
  workflow: any
}

export function WorkflowDetail({ workflow }: WorkflowDetailProps) {
  const [showRawState, setShowRawState] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    analysis: true,
    parsedCV: false,
    state: false
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'queued':
      case 'parsing':
      case 'retrieving':
      case 'consolidating':
      case 'analyzing':
        return <Activity className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button size="sm" asChild>
            <Link href="/workflows">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workflows
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            {getStatusIcon(workflow.status)}
            <h1 className="text-3xl font-bold text-gray-900">Workflow Details</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(workflow.status)}>
            {workflow.status}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(workflow.id)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy ID
          </Button>
        </div>
      </div>

      {/* Main Information Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Candidate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Candidate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{workflow.candidate.name}</p>
              <p className="text-sm text-gray-600">{workflow.candidate.email}</p>
              {workflow.candidate.phone && (
                <p className="text-sm text-gray-600">{workflow.candidate.phone}</p>
              )}
              {workflow.candidate.linkedin_url && (
                <a
                  href={workflow.candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  LinkedIn Profile
                </a>
              )}
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/candidates/${workflow.candidate.id}`}>
                View Candidate Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Rejected Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Rejected Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{workflow.rejected_job.title}</p>
              <p className="text-sm text-gray-600">{workflow.rejected_job.company?.name}</p>
              {workflow.rejected_job.department && (
                <p className="text-sm text-gray-600">{workflow.rejected_job.department}</p>
              )}
              {workflow.rejected_job.location && (
                <p className="text-sm text-gray-600">{workflow.rejected_job.location}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{workflow.rejected_job.job_type}</Badge>
                <Badge variant="outline">{workflow.rejected_job.experience_level}</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/jobs/${workflow.rejected_job.id}`}>
                View Job Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Execution Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{formatDuration(workflow.duration_ms)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Match Count:</span>
                <span className="text-sm font-medium">{workflow.match_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}
                </span>
              </div>
              {workflow.completed_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(workflow.completed_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
            {workflow.final_analysis && (
              <div className="pt-2 border-t">
                <Badge className="bg-green-100 text-green-800">
                  Analysis Complete
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Timeline */}
      <WorkflowTimeline workflow={workflow} />

      {/* Error Display */}
      {workflow.error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-900">Error Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{workflow.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {workflow.match_results && workflow.match_results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Results ({workflow.match_results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchResultsTable matches={workflow.match_results} />
          </CardContent>
        </Card>
      )}

      {/* Final Analysis */}
      {workflow.final_analysis && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('analysis')}
            >
              <span>AI Analysis</span>
              {expandedSections.analysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.analysis && (
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {workflow.final_analysis}
                  </pre>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Parsed CV Data */}
      {workflow.parsed_cv && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('parsedCV')}
            >
              <span>Parsed CV Data</span>
              {expandedSections.parsedCV ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.parsedCV && (
            <CardContent>
              <WorkflowStateDisplay
                title="Parsed CV"
                data={workflow.parsed_cv}
                defaultExpanded={false}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Workflow State */}
      {workflow.state && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('state')}
            >
              <span>Workflow State Data</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRawState(!showRawState)
                  }}
                >
                  {showRawState ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {expandedSections.state ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardTitle>
          </CardHeader>
          {expandedSections.state && (
            <CardContent>
              <WorkflowStateDisplay
                title="Complete State"
                data={workflow.state}
                defaultExpanded={false}
                showRaw={showRawState}
              />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}