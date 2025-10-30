'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RejectCandidateButton } from '@/components/candidates/reject-candidate-button'
import { ApplicationStatusDropdown } from '@/components/applications/application-status-dropdown'
import { ApplicationStatusTimeline } from '@/components/applications/application-status-timeline'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar, Building2 } from 'lucide-react'
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
    return <p className="text-gray-500">No applications yet</p>
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {applications.map((application) => (
        <Card key={application.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{application.job.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="h-3 w-3" />
                  <span>{application.job.department || 'No department'}</span>
                  {application.job.location && (
                    <>
                      <span>•</span>
                      <span>{application.job.location}</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/jobs/${application.job_id}`)}
                className="flex items-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View Job</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Application Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Applied {formatDate(application.applied_at)}</span>
              </div>

              {/* Status Management */}
              <div className="flex items-center space-x-2">
                <ApplicationStatusDropdown
                  applicationId={application.id}
                  currentStatus={application.status}
                  onStatusChange={(newStatus, reason) => handleStatusChange(application.id, newStatus, reason)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Rejection Reason */}
            {application.status === 'rejected' && application.rejection_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{application.rejection_reason}</p>
              </div>
            )}

            {/* Status History Timeline */}
            <ApplicationStatusTimeline
              applicationId={application.id}
              compact={true}
              maxItems={3}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}