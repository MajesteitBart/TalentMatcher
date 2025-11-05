'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, X, Mail, Phone, Calendar, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Eye, ArrowRight } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row'] & {
  applications: (Database['public']['Tables']['applications']['Row'] & {
    job: Database['public']['Tables']['jobs']['Row'];
    workflow_executions?: Database['public']['Tables']['workflow_executions']['Row'][];
  })[];
}

interface CandidateSearchClientProps {
  candidates: Candidate[]
}

export function CandidateSearchClient({ candidates }: CandidateSearchClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set<string>()
    candidates.forEach(candidate => {
      candidate.applications.forEach(app => {
        if (app.job.department) {
          depts.add(app.job.department)
        }
      })
    })
    return Array.from(depts).sort()
  }, [candidates])

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.includes(searchTerm)

      // Status filter
      const latestApplication = candidate.applications[0]
      const currentStatus = latestApplication?.status || 'no_status'
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter

      // Department filter
      const matchesDepartment = departmentFilter === 'all' ||
        candidate.applications.some(app => app.job.department === departmentFilter)

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [candidates, searchTerm, statusFilter, departmentFilter])

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDepartmentFilter('all')
  }

  if (candidates.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Search & Filter</h3>
            {hasActiveFilters && (
              <Button size="sm" variant="ghost" onClick={clearFilters} className="ml-auto">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 search-input"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select pl-10"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
                <option value="no_status">No Status</option>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select pl-10"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCandidates.length} of {candidates.length} candidates
            {hasActiveFilters && ' (filtered)'}
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {filteredCandidates.length > 0 && (
        <Card>
          <CardContent className="p-0">
              {filteredCandidates.map((candidate) => {
                const latestApplication = candidate.applications[0]
                const hasRejection = candidate.applications.some(
                  (app) => app.status === 'rejected'
                )

                return (
                  <div
                    key={candidate.id}
                    className="p-6 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground text-lg">{candidate.name}</h3>
                            {latestApplication && (
                              <Badge className={`status-badge status-${latestApplication.status}`}>
                                {latestApplication.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {candidate.email}
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {candidate.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {candidate.applications.length} application{candidate.applications.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          {latestApplication && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Latest: </span>
                              <span className="font-medium text-foreground">{latestApplication.job.title}</span>
                              {latestApplication.job.department && (
                                <span className="text-muted-foreground"> • {latestApplication.job.department}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="success" asChild>
                          <Link href={`/candidates/${candidate.id}`}>
                              View
                              <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                       
                      </div>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {filteredCandidates.length === 0 && hasActiveFilters && (
        <Card className="interactive-card border-dashed border-2 border-muted-foreground/20">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No candidates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}