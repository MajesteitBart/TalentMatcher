'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { JobDetail } from '@/components/jobs/job-detail'
import { CandidateListForJob } from '@/components/jobs/candidate-list-for-job'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Users, Briefcase, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { JobWithCompany } from '@/lib/types/database'

interface JobDetailClientProps {
  job: JobWithCompany
}

export function JobDetailClient({ job }: JobDetailClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [candidateStats, setCandidateStats] = useState({
    total: 0,
    pending: 0,
    interviewing: 0,
    accepted: 0,
    rejected: 0
  })

  const fetchCandidateStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/candidates?limit=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCandidateStats({
            total: data.data.pagination.total,
            pending: 0, // We'll get this from the full data
            interviewing: 0,
            accepted: 0,
            rejected: 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch candidate stats:', error)
    }
  }, [job.id])

  useEffect(() => {
    // Fetch candidate statistics
    fetchCandidateStats()
  }, [fetchCandidateStats])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Job deleted successfully')
        router.push('/jobs')
      } else {
        const data = await response.json()
        toast.error(data.error?.message || 'Failed to delete job')
      }
    } catch (error) {
      toast.error('An error occurred while deleting the job')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800'
      case 'mid': return 'bg-blue-100 text-blue-800'
      case 'senior': return 'bg-purple-100 text-purple-800'
      case 'lead': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-indigo-100 text-indigo-800'
      case 'part-time': return 'bg-yellow-100 text-yellow-800'
      case 'contract': return 'bg-red-100 text-red-800'
      case 'internship': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-lg text-gray-600">{job.company?.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/jobs/${job.id}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </Button>
        </div>
      </div>

      {/* Job metadata */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge className={getExperienceLevelColor(job.experience_level)}>
          {job.experience_level}
        </Badge>
        <Badge className={getJobTypeColor(job.job_type)}>
          {job.job_type}
        </Badge>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Briefcase className="h-3 w-3" />
          <span>{job.department || 'General'}</span>
        </Badge>
        <Badge variant="outline" className="flex items-center space-x-1">
          <MapPin className="h-3 w-3" />
          <span>{job.location || 'Remote'}</span>
        </Badge>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Posted {formatDate(job.created_at)}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main job details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details Component */}
          <JobDetail job={job} />

          {/* Candidates Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Candidates</CardTitle>
                </div>
                <Badge variant="secondary">
                  {candidateStats.total} candidates
                </Badge>
              </div>
              <CardDescription>
                People who have applied for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateListForJob jobId={job.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applicants</span>
                <span className="font-semibold">{candidateStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge
                  variant={job.status === 'active' ? 'default' : 'secondary'}
                  className={job.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {job.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Required Skills</span>
                <span className="font-semibold">{job.required_skills.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Posted Date</span>
                <span className="text-sm">{formatDate(job.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name</span>
                <p className="font-medium">{job.company?.name}</p>
              </div>
              {job.company?.domain && (
                <div>
                  <span className="text-sm text-gray-600">Website</span>
                  <p className="font-medium">
                    <a
                      href={`https://${job.company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {job.company.domain}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}