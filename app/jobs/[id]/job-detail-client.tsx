'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { JobDetail } from '@/components/jobs/job-detail'
import { CandidateListForJob } from '@/components/jobs/candidate-list-for-job'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Users, Briefcase, MapPin, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { JobWithCompany } from '@/lib/types/database'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

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


  return (
    <LayoutWrapper>
      
    <div className="container mx-auto px-4 py-8 max-w-6xl ">
      <div className="flex items-center justify-between mb-4">
      <div className="space-y-6 flex-1">
      {/* Header with actions */}
      <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
     
       
      </div>

    </div>
    

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main job details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details Component */}
          <JobDetail job={job} />

          {/* Candidates Section */}
          <Card id="candidates-section">
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
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push(`/jobs/${job.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/candidates/add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </Button>
            </CardContent>
          </Card>

          {/* Application Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">{candidateStats.total}</p>
                  <p className="text-sm text-blue-600">Total Applicants</p>
                </div>
              </div>
              {candidateStats.total > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('candidates-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Candidates
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge
                  variant={job.status === 'active' ? 'default' : 'secondary'}
                  className={job.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Experience Level</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {job.experience_level}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job Type</span>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {job.job_type.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Skills Required</span>
                <span className="font-semibold">{job.required_skills.length}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Posted {formatDate(job.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </LayoutWrapper>
  )
}