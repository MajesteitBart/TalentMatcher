'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, User, Mail, Calendar, FileText, ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { ApplicationStatusDropdown } from '@/components/applications/application-status-dropdown'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string | null
  linkedin_url: string | null
  cv_file_url: string | null
  created_at: string
  parsed_cv: {
    summary: string | null
    skills: string | null
    work_experience: string | null
    education: string | null
    validation_status: string | null
  } | null
  application: {
    id: string
    status: string
    applied_at: string
    rejected_at: string | null
    rejection_reason: string | null
  }
}

interface PaginatedResponse {
  success: boolean
  data: {
    candidates: Candidate[]
    pagination: {
      page: number
      per_page: number
      total: number
      total_pages: number
    }
  }
}

interface CandidateListForJobProps {
  jobId: string
}

export function CandidateListForJob({ jobId }: CandidateListForJobProps) {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('applied_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  })

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchTerm) {
        // Note: The API would need to be enhanced to support search
        // For now, we'll filter on the client side
      }

      const response = await fetch(`/api/jobs/${jobId}/candidates?${params}`)
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        if (data.success) {
          let filteredCandidates = data.data.candidates

          // Client-side filtering for search term
          if (searchTerm) {
            filteredCandidates = filteredCandidates.filter(candidate =>
              candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }

          setCandidates(filteredCandidates)
          setPagination(data.data.pagination)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error?.message || 'Failed to fetch candidates')
      }
    } catch (error) {
      toast.error('An error occurred while fetching candidates')
    } finally {
      setLoading(false)
    }
  }, [jobId, searchTerm, statusFilter, sortBy, sortOrder, currentPage])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'offer_extended': return 'bg-green-100 text-green-800'
      case 'hired': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getValidationStatusColor = (status: string | null) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'needs_review': return 'bg-yellow-100 text-yellow-800'
      case 'invalid': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusChange = (newStatus: string, rejectionReason?: string) => {
    // Refresh the candidate list to show updated status
    setRefreshKey(prev => prev + 1)
    toast.success(`Application status updated to ${newStatus}`)
    fetchCandidates()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading candidates...</span>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
        <p className="text-gray-600">
          {searchTerm || statusFilter !== 'all'
            ? 'No candidates match your current filters.'
            : 'No candidates have applied for this position yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="offer_extended">Offer Extended</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('applied_at')}
                  className="font-semibold"
                >
                  Applied Date
                  {sortBy === 'applied_at' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CV Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {candidate.email}
                    </div>
                    {candidate.phone && (
                      <div className="text-sm text-gray-500">{candidate.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(candidate.application.applied_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <ApplicationStatusDropdown
                    applicationId={candidate.application.id}
                    currentStatus={candidate.application.status}
                    onStatusChange={handleStatusChange}
                    showFullLabel={false}
                  />
                  {candidate.application.rejected_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Rejected: {formatDate(candidate.application.rejected_at)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {candidate.parsed_cv ? (
                    <Badge className={getValidationStatusColor(candidate.parsed_cv.validation_status)}>
                      {candidate.parsed_cv.validation_status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not parsed</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">View Profile</span>
                    </Button>
                    {candidate.cv_file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => candidate.cv_file_url && window.open(candidate.cv_file_url, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View CV</span>
                      </Button>
                    )}
                    {candidate.linkedin_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => candidate.linkedin_url && window.open(candidate.linkedin_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} candidates
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.total_pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}