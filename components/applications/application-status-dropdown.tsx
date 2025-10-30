'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle, Clock, Calendar, Briefcase, User, XCircle } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  { value: 'under_review', label: 'Under Review', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { value: 'offer_extended', label: 'Offer Extended', icon: Briefcase, color: 'bg-green-100 text-green-800' },
  { value: 'hired', label: 'Hired', icon: User, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' }
]

interface ApplicationStatusDropdownProps {
  applicationId: string
  currentStatus: string
  onStatusChange?: (newStatus: string, rejectionReason?: string) => void
  disabled?: boolean
  showFullLabel?: boolean
}

export function ApplicationStatusDropdown({
  applicationId,
  currentStatus,
  onStatusChange,
  disabled = false,
  showFullLabel = true
}: ApplicationStatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const currentStatusInfo = STATUS_OPTIONS.find(option => option.value === currentStatus)

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value

    // Don't proceed if no valid status is selected
    if (!newStatus || newStatus === currentStatus) return

    if (newStatus === 'rejected') {
      setSelectedStatus(newStatus)
      setIsRejectionModalOpen(true)
      return
    }

    await updateStatus(newStatus)
  }

  const updateStatus = async (status: string, reason?: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          rejection_reason: reason
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Application status updated to ${STATUS_OPTIONS.find(s => s.value === status)?.label}`)
        setSelectedStatus(status)
        onStatusChange?.(status, reason)
      } else {
        toast.error(data.error?.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
      setIsRejectionModalOpen(false)
      setRejectionReason('')
    }
  }

  const handleRejectionConfirm = async () => {
    await updateStatus('rejected', rejectionReason)
  }

  const handleRejectionCancel = () => {
    setIsRejectionModalOpen(false)
    setRejectionReason('')
    setSelectedStatus(currentStatus)
  }

  if (currentStatusInfo && !showFullLabel) {
    return (
      <Badge className={`${currentStatusInfo.color} ${disabled ? 'opacity-50' : ''}`}>
        <currentStatusInfo.icon className="w-3 h-3 mr-1" />
        {currentStatusInfo.label}
      </Badge>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {currentStatusInfo && (
          <Badge className={`${currentStatusInfo.color} ${disabled || isUpdating ? 'opacity-50' : ''}`}>
            <currentStatusInfo.icon className="w-3 h-3 mr-1" />
            {currentStatusInfo.label}
          </Badge>
        )}

        {!disabled && (
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className="w-[200px]"
          >
            <option value="" disabled>Change status...</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this candidate. This will be recorded in the application history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRejectionCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectionConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? 'Rejecting...' : 'Reject Candidate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function getStatusColor(status: string): string {
  const statusInfo = STATUS_OPTIONS.find(option => option.value === status)
  return statusInfo?.color || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const statusInfo = STATUS_OPTIONS.find(option => option.value === status)
  return statusInfo?.label || status
}