'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { JobWithCompany } from '@/lib/types/database'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface JobFormData {
  title: string
  description: string
  required_skills: string[]
  experience_level: string
  department: string
  location: string
  job_type: string
  status: string
  company_id: string
}

interface JobFormProps {
  job?: JobWithCompany
  companies: Array<{ id: string; name: string; domain: string | null }>
}

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead Level' },
  { value: 'executive', label: 'Executive Level' }
]

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
]

const jobStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' }
]

export function JobForm({ job, companies }: JobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')

  const [formData, setFormData] = useState<JobFormData>({
    title: job?.title || '',
    description: job?.description || '',
    required_skills: job?.required_skills || [],
    experience_level: job?.experience_level || 'mid',
    department: job?.department || '',
    location: job?.location || '',
    job_type: job?.job_type || 'full-time',
    status: job?.status || 'active',
    company_id: job?.company_id || companies[0]?.id || ''
  })

  const handleInputChange = (field: keyof JobFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      handleInputChange('required_skills', [...formData.required_skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    handleInputChange('required_skills', formData.required_skills.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = job ? `/api/jobs/${job.id}` : '/api/jobs'
      const method = job ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save job')
      }

      setSuccess(job ? 'Job updated successfully!' : 'Job created successfully!')

      // Redirect to jobs page after a short delay
      setTimeout(() => {
        router.push('/jobs')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (companies.length === 0) {
    return (
      <LayoutWrapper>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Companies Available
              </h3>
              <p className="text-gray-600">
                You need to create a company before you can add jobs.
              </p>
            </CardContent>
          </Card>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button size="sm" asChild>
              <Link href="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {job ? 'Edit Job' : 'Create New Job'}
            </h1>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <p className="text-green-800 text-sm">{success}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection */}
              <div>
                <Label htmlFor="company_id">Company *</Label>
                <Select
                  id="company_id"
                  value={formData.company_id}
                  onChange={(e) => handleInputChange('company_id', e.target.value)}
                  required
                  disabled={!!job}
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
                {job && (
                  <p className="text-sm text-gray-500 mt-1">
                    Company cannot be changed after job creation
                  </p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              {/* Job Description */}
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
                  rows={6}
                  required
                />
              </div>

              {/* Required Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.required_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div>
                  <Label htmlFor="experience_level">Experience Level *</Label>
                  <Select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    required
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Job Type */}
                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => handleInputChange('job_type', e.target.value)}
                    required
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g. Engineering"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                >
                  {jobStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" asChild>
                  <Link href="/jobs">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}