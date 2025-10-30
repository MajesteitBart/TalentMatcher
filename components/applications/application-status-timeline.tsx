'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  User,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'
import { getStatusColor, getStatusLabel } from './application-status-dropdown'

interface StatusHistoryItem {
  id: string
  application_id: string
  old_status: string | null
  new_status: string
  changed_by: string | null
  rejection_reason: string | null
  changed_at: string
  changer?: {
    email: string | null
    name: string | null
  }
}

interface ApplicationStatusTimelineProps {
  applicationId: string
  compact?: boolean
  maxItems?: number
}

export function ApplicationStatusTimeline({
  applicationId,
  compact = false,
  maxItems = 10
}: ApplicationStatusTimelineProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatusHistory()
  }, [applicationId])

  const fetchStatusHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/applications/${applicationId}/status`)

      if (!response.ok) {
        throw new Error('Failed to fetch status history')
      }

      const data = await response.json()

      if (data.success) {
        setHistory(data.data.status_history || [])
      } else {
        setError(data.error?.message || 'Failed to fetch status history')
      }
    } catch (error) {
      console.error('Status history fetch error:', error)
      setError('Failed to load status history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return formatDate(dateString)
    }
  }

  const displayHistory = showAll ? history : history.slice(0, maxItems)

  if (loading) {
    return (
      <Card className={compact ? 'border-none shadow-none' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">Loading status history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={compact ? 'border-none shadow-none' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Failed to load status history</span>
            <Button variant="outline" size="sm" onClick={fetchStatusHistory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={compact ? 'border-none shadow-none' : ''}>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No status changes recorded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={compact ? 'border-none shadow-none' : ''}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Status History
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${compact ? 'p-0' : 'pt-0'}`}>
        <div className="space-y-4">
          {displayHistory.map((item, index) => (
            <div key={item.id} className="relative">
              {index < displayHistory.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
              )}

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.new_status === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {item.new_status === 'rejected' ? (
                      <MessageCircle className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {item.old_status && (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {getStatusLabel(item.old_status)}
                        </Badge>
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <Badge className={`text-xs ${getStatusColor(item.new_status)}`}>
                      {getStatusLabel(item.new_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.changed_at)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(item.changed_at)}</span>
                  </div>

                  {item.changer && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                      <User className="h-3 w-3" />
                      <span>
                        Changed by {item.changer.name || item.changer.email || 'Unknown user'}
                      </span>
                    </div>
                  )}

                  {item.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="h-3 w-3 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-xs text-red-700 mt-1">{item.rejection_reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {index < displayHistory.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}

          {history.length > maxItems && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-xs"
              >
                {showAll ? (
                  <>
                    Show Less <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Show {history.length - maxItems} More <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}