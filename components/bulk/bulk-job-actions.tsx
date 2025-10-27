'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Archive, Search } from 'lucide-react'
import type { JobWithCompany } from '@/lib/types/database'

interface BulkJobActionsProps {
  selectedJobs: string[]
  onToggleJob: (jobId: string) => void
  onClearSelection: () => void
  onUpdateSelectedJobs: (jobIds: string[], updates: Partial<JobWithCompany>) => void
  onDeleteSelectedJobs: (jobIds: string[]) => void
  onIndexSelectedJobs: (jobIds: string[]) => void
  allJobs: JobWithCompany[]
}

export function BulkJobActions({
  selectedJobs,
  onToggleJob,
  onClearSelection,
  onUpdateSelectedJobs,
  onDeleteSelectedJobs,
  onIndexSelectedJobs,
  allJobs
}: BulkJobActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allJobIds = allJobs.map(job => job.id)
      allJobIds.forEach(id => {
        if (!selectedJobs.includes(id)) {
          onToggleJob(id)
        }
      })
    } else {
      onClearSelection()
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedJobs.length === 0) return

    setLoading('status')

    try {
      await onUpdateSelectedJobs(selectedJobs, { status: status as any })
      onClearSelection()
    } catch (error) {
      console.error('Bulk status update failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleBulkIndex = async () => {
    if (selectedJobs.length === 0) return

    setLoading('index')

    try {
      await onIndexSelectedJobs(selectedJobs)
      onClearSelection()
    } catch (error) {
      console.error('Bulk indexing failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) return

    const jobTitles = allJobs
      .filter(job => selectedJobs.includes(job.id))
      .map(job => job.title)
      .slice(0, 3)
      .join(', ')

    const confirmMessage = selectedJobs.length > 3
      ? `Are you sure you want to delete ${selectedJobs.length} jobs (including "${jobTitles}...")? This action cannot be undone.`
      : `Are you sure you want to delete "${jobTitles}"? This action cannot be undone.`

    if (!confirm(confirmMessage)) {
      return
    }

    setLoading('delete')

    try {
      await onDeleteSelectedJobs(selectedJobs)
      onClearSelection()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const isAllSelected = allJobs.length > 0 && selectedJobs.length === allJobs.length
  const isPartiallySelected = selectedJobs.length > 0 && selectedJobs.length < allJobs.length

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(ref) => {
                  if (ref) {
                    ref.indeterminate = isPartiallySelected
                  }
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                {selectedJobs.length} of {allJobs.length} jobs selected
              </span>
            </label>
          </div>
          {selectedJobs.length > 0 && (
            <Button size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {selectedJobs.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('active')}
              disabled={loading === 'status'}
            >
              <Archive className="w-4 h-4 mr-2" />
              {loading === 'status' ? 'Updating...' : 'Set Active'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('closed')}
              disabled={loading === 'status'}
            >
              <Archive className="w-4 h-4 mr-2" />
              {loading === 'status' ? 'Updating...' : 'Set Closed'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkIndex}
              disabled={loading === 'index'}
            >
              <Search className="w-4 h-4 mr-2" />
              {loading === 'index' ? 'Indexing...' : 'Index for Search'}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={loading === 'delete'}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {loading === 'delete' ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}