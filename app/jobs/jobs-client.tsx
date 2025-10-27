'use client'

import { useState } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { JobWithCompany } from '@/lib/types/database'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Plus, Edit, Trash2, Briefcase, MapPin, Clock, Users, Search } from 'lucide-react'

interface Company {
  id: string
  name: string
  domain: string | null
}

interface JobsClientProps {
  initialJobs: JobWithCompany[]
  initialCompanies: Company[]
}

export function JobsClient({ initialJobs, initialCompanies }: JobsClientProps) {
  const [jobs, setJobs] = useState<JobWithCompany[]>(initialJobs)
  const [companies] = useState<Company[]>(initialCompanies)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [showIndexModal, setShowIndexModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState('')

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesCompany = companyFilter === 'all' || job.company_id === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(jobId)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error?.code === 'HAS_DEPENDENCIES') {
          alert('Cannot delete job that has existing applications. Please close the job instead.')
        } else {
          throw new Error(result.error?.message || 'Failed to delete job')
        }
        return
      }

      // Remove job from state
      setJobs(prev => prev.filter(job => job.id !== jobId))

    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while deleting the job')
    } finally {
      setActionLoading(null)
    }
  }

  const handleIndexJobs = async () => {
    if (!selectedCompany) {
      alert('Please select a company')
      return
    }

    setActionLoading('indexing')

    try {
      const response = await fetch('/api/jobs/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: selectedCompany
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to index jobs')
      }

      alert(`Successfully queued indexing for ${result.data.count} job(s)`)
      setShowIndexModal(false)
      setSelectedCompany('')

    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while indexing jobs')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <div className="flex space-x-4">
            <Button onClick={() => setShowIndexModal(true)}>
              Index All Jobs
            </Button>
            <Button className="flex items-center space-x-2" asChild>
              <Link href="/jobs/new">
                <Plus className="w-4 h-4" />
                <span>Add New Job</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Select
                  id="company"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {jobs.length === 0
                  ? 'Get started by adding your first job posting to system.'
                  : 'Try adjusting your search or filters.'
                }
              </p>
              {jobs.length === 0 && (
                <Button className="flex items-center space-x-2" asChild>
                  <Link href="/jobs/new">
                    <Plus className="w-4 h-4" />
                    <span>Add New Job</span>
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-gray-600">{job.company.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'closed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        disabled={actionLoading === job.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {actionLoading === job.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {job.required_skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{job.job_type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{job.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 capitalize">{job.experience_level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDistanceToNow(new Date(job.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Index Jobs Modal */}
        {showIndexModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Index Jobs for Vector Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-select">Select Company</Label>
                  <Select
                    id="company-select"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    <option value="">Choose a company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowIndexModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleIndexJobs}
                    disabled={actionLoading === 'indexing' || !selectedCompany}
                    className="flex-1"
                  >
                    {actionLoading === 'indexing' ? 'Indexing...' : 'Index Jobs'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}