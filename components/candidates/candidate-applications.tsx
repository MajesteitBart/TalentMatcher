'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RejectCandidateButton } from '@/components/candidates/reject-candidate-button'
import { useRouter } from 'next/navigation'
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
      router.push('/workflows')
      router.refresh()

    } catch (error) {
      console.error('Error rejecting candidate:', error)
      alert('Failed to reject candidate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (applications.length === 0) {
    return <p className="text-gray-500">No applications yet</p>
  }

  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <div
          key={application.id}
          className="flex flex-col justify-between p-3 bg-gray-50 rounded-lg space-y-2 "
        >
          <div className="flex-1">
            <p className="lg:text-lg font-medium text-gray-900">
              {application.job.title}
            </p>
            
          </div>
          
            <RejectCandidateButton
              application={application}
              candidate={candidate}
              onReject={handleRejectCandidate}
            />
          
        </div>
      ))}
    </div>
  )
}