'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Application = Database['public']['Tables']['applications']['Row'] & {
  job: Database['public']['Tables']['jobs']['Row'];
}

type Candidate = Database['public']['Tables']['candidates']['Row']

interface RejectCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  onReject: (applicationId: string, rejectionReason: string) => void
  application: Application
  candidate: Candidate
}

export function RejectCandidateModal({
  isOpen,
  onClose,
  onReject,
  application,
  candidate
}: RejectCandidateModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onReject(application.id, rejectionReason)
      onClose()
      setRejectionReason('')
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Reject Candidate</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Rejecting <strong>{candidate.name}</strong> for:
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{application.job.title}</p>
                <p className="text-sm text-gray-600">
                  {application.job.department} • {application.job.location}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Candidate'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface RejectCandidateButtonProps {
  application: Application
  candidate: Candidate
  onReject: (applicationId: string, rejectionReason: string) => Promise<void>
}

export function RejectCandidateButton({ application, candidate, onReject }: RejectCandidateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (application.status === 'rejected') {
    return (
      <Badge variant="destructive">
        Rejected
        {application.rejection_reason && (
          <span className="ml-1 text-xs">({application.rejection_reason})</span>
        )}
      </Badge>
    )
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsModalOpen(true)}
      >
        Reject
      </Button>

      <RejectCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReject={onReject}
        application={application}
        candidate={candidate}
      />
    </>
  )
}