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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" asChild className="hover:scale-105 transition-transform">
          <Link href="/workflows">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {getStatusIcon(workflow.status)}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Workflow Execution</h1>
            <p className="text-lg text-muted-foreground mt-1">Candidate matching workflow details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${getStatusColor(workflow.status)} font-semibold px-3 py-1`}>
            {workflow.status}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(workflow.id)}
            className="hover:scale-105 transition-transform"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy ID
          </Button>
        </div>
      </div>

      {/* Main Information Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Candidate Information */}
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-background border-b">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg">Candidate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {workflow.candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{workflow.candidate.name}</p>
                <p className="text-sm text-muted-foreground">{workflow.candidate.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {workflow.candidate.phone && (
                <p className="text-sm text-muted-foreground">{workflow.candidate.phone}</p>
              )}
              {workflow.candidate.linkedin_url && (
                <a
                  href={workflow.candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                >
                  LinkedIn Profile
                </a>
              )}
            </div>
            <Button size="sm" variant="outline" asChild className="w-full mt-4 hover:scale-105 transition-transform">
              <Link href={`/candidates/${workflow.candidate.id}`}>
                View Candidate Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Rejected Job Information */}
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-background border-b">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-lg">Rejected Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              <p className="font-semibold text-foreground text-lg">{workflow.rejected_job.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{workflow.rejected_job.company?.name}</p>
              {workflow.rejected_job.department && (
                <p className="text-sm text-muted-foreground">{workflow.rejected_job.department}</p>
              )}
              {workflow.rejected_job.location && (
                <p className="text-sm text-muted-foreground">{workflow.rejected_job.location}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">{workflow.rejected_job.job_type}</Badge>
                <Badge variant="outline">{workflow.rejected_job.experience_level}</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="w-full mt-4 hover:scale-105 transition-transform">
              <Link href={`/jobs/${workflow.rejected_job.id}`}>
                View Job Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Summary */}
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-lg">Execution Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                  <p className="text-lg font-semibold text-foreground">{formatDuration(workflow.duration_ms)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Matches</p>
                  <p className="text-lg font-semibold text-foreground">{workflow.match_count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">
                    {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}
                  </span>
                </div>
                {workflow.completed_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="text-foreground">
                      {formatDistanceToNow(new Date(workflow.completed_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {workflow.final_analysis && (
                <div className="pt-3 border-t">
                  <Badge className="bg-green-100 text-green-800 border border-green-200 font-medium">
                    ✓ Analysis Complete
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Timeline */}
      <Card className="interactive-card shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
          <CardTitle className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xl">Workflow Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <WorkflowTimeline workflow={workflow} />
        </CardContent>
      </Card>

      {/* Error Display */}
      {workflow.error && (
        <Card className="interactive-card shadow-lg border-0 border-destructive/20">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-background border-b border-destructive/20">
            <CardTitle className="flex items-center space-x-3 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="text-xl">Error Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">{workflow.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {workflow.match_results && workflow.match_results.length > 0 && (
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="flex items-center space-x-3 text-green-800">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xl">Match Results ({workflow.match_results.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <MatchResultsTable matches={workflow.match_results} />
          </CardContent>
        </Card>
      )}

      {/* Final Analysis */}
      {workflow.final_analysis && (
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-background border-b">
            <CardTitle
              className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleSection('analysis')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xl">AI Analysis</span>
              </div>
              {expandedSections.analysis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.analysis && (
            <CardContent className="pt-6">
              <div className="prose prose-lg max-w-none">
                <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
                  <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
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
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-xl">Parsed CV Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
       
         
           
                        <WorkflowStateDisplay
                title="Parsed CV"
                data={workflow.parsed_cv}
                defaultExpanded={false}
              />
          </CardContent>
        </Card>
      )}

      {/* Workflow State */}
      {workflow.state && (
        <Card className="interactive-card shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-xl">Complete State</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRawState(!showRawState)}
                  className="hover:scale-105 transition-transform"
                >
                  {showRawState ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showRawState ? 'Hide Raw' : 'Show Raw'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <WorkflowStateDisplay
              title="Complete State"
              data={workflow.state}
              defaultExpanded={false}
              showRaw={showRawState}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}