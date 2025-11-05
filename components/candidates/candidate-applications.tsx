'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RejectCandidateButton } from '@/components/candidates/reject-candidate-button'
import { ApplicationStatusDropdown } from '@/components/applications/application-status-dropdown'
import { ApplicationStatusTimeline } from '@/components/applications/application-status-timeline'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar, Building2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Database, CandidateWithApplications } from '@/lib/types/database'

type Application = Database['public']['Tables']['applications']['Row'] & {
  job: Database['public']['Tables']['jobs']['Row'];
}

type Candidate = Database['public']['Tables']['candidates']['Row']

interface CandidateApplicationsProps {
  applications: Application[]
  candidate: Candidate
}

export function CandidateApplications({ applications, candidate }: CandidateApplicationsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRejectCandidate = async (applicationId: string, rejectionReason: string) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/candidates/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: candidate.id,
          application_id: applicationId,
          rejection_reason: rejectionReason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to reject candidate')
      }

      const result = await response.json()

      // Show success message and redirect to workflows page to see the progress
      console.log('Candidate rejection workflow started:', result.data.workflow_execution_id)
      toast.success('Candidate rejected and alternative job matching started')

      // Refresh the component to show updated status
      setRefreshKey(prev => prev + 1)
      router.refresh()

    } catch (error) {
      console.error('Error rejecting candidate:', error)
      toast.error('Failed to reject candidate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string, rejectionReason?: string) => {
    // If status is changing to rejected, also trigger the workflow
    if (newStatus === 'rejected') {
      await handleRejectCandidate(applicationId, rejectionReason || '')
    } else {
      // For other status changes, just refresh the component
      setRefreshKey(prev => prev + 1)
      router.refresh()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground italic">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {applications.map((application) => (
        <div
          key={application.id}
          className="p-4 rounded-lg border border-border bg-gradient-to-r from-background to-muted/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{application.job.title}</h3>
                  <Badge className={`status-badge status-${application.status} mt-1`}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{application.job.department || 'No department'}</span>
                </div>
                {application.job.location && (
                  <span className="flex items-center space-x-1">
                    <span>•</span>
                    <span>{application.job.location}</span>
                  </span>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {formatDate(application.applied_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <ApplicationStatusDropdown
              applicationId={application.id}
              currentStatus={application.status}
              onStatusChange={(newStatus, reason) => handleStatusChange(application.id, newStatus, reason)}
              disabled={isLoading || application.status === 'rejected'}
            />

            <Button size="sm" variant="outline" asChild>
              <a href={`/jobs/${application.job.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Job
              </a>
            </Button>
          </div>

          {/* Rejection Reason */}
          {application.status === 'rejected' && application.rejection_reason && (
            <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
              <p className="text-sm text-muted-foreground">{application.rejection_reason}</p>
            </div>
          )}

          {/* Status History Timeline */}
          <div className="mt-4">
            <ApplicationStatusTimeline
              applicationId={application.id}
              compact={true}
              maxItems={3}
            />
          </div>
        </div>
      ))}
    </div>
  )
}