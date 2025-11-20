'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateListForJob } from '@/components/jobs/candidate-list-for-job'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Users, Plus, Building, MapPin, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import type { JobWithCompany } from '@/lib/types/database'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { formatDistanceToNow } from 'date-fns'

interface JobDetailClientProps {
  job: JobWithCompany
}

export function JobDetailClient({ job }: JobDetailClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [candidateStats, setCandidateStats] = useState({
    total: 0
  })

  const fetchCandidateStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/candidates?limit=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCandidateStats({
            total: data.data.pagination.total
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch candidate stats:', error)
    }
  }, [job.id])

  useEffect(() => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Clean Header with Essential Actions */}
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => router.push(`/jobs/${job.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {candidateStats.total > 0 && (
              <Button size="sm" asChild>
                <a href="#candidates-section">
                  <Users className="w-4 h-4 mr-2" />
                  {candidateStats.total} Applications
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Single-Source Job Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground truncate">{job.title}</h1>
                  <Badge className={`${getStatusColor(job.status)} text-xs`}>
                    {job.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{job.company?.name}</span>
                  </div>
                  {job.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    </>
                  )}
                  {job.department && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge className={`${getExperienceLevelColor(job.experience_level)} text-xs`}>
                    {job.experience_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.job_type.replace('-', ' ')}
                  </Badge>
                  <span>•</span>
                  <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{job.required_skills.length} skills required</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Single Column Layout - Better Focus */}
        <div className="space-y-6">
          {/* Job Description - Priority Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {job.required_skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Section */}
          <Card id="candidates-section">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Applications
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Candidates who have applied for this position
                  </CardDescription>
                </div>
                {candidateStats.total === 0 && (
                  <Button size="sm" onClick={() => router.push('/candidates/add')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {candidateStats.total > 0 ? (
                <CandidateListForJob jobId={job.id} />
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No applications yet</p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => router.push('/candidates/add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Candidate
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/candidates')}>
                      Browse Candidates
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone - Minimal */}
          <Card className="border-red-100 bg-red-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Delete this job permanently</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Job'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
}