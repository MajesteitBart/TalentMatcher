import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Briefcase, MapPin, Clock, Users, Building } from 'lucide-react'
import type { JobWithCompany } from '@/lib/types/database'

interface JobDetailProps {
  job: JobWithCompany
}

export function JobDetail({ job }: JobDetailProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{job.company?.name}</span>
              </div>
              {job.company?.domain && (
                <span>• {job.company.domain}</span>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Badge className={getExperienceLevelColor(job.experience_level)}>
            {job.experience_level}
          </Badge>
          <Badge className={getJobTypeColor(job.job_type)}>
            {job.job_type}
          </Badge>
          {job.department && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Briefcase className="h-3 w-3" />
              <span>{job.department}</span>
            </Badge>
          )}
          {job.location && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Job Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Job Description</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        <Separator />

        {/* Required Skills */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
          {job.required_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No specific skills required</p>
          )}
        </div>

        <Separator />

        {/* Job Details Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Experience Level</p>
                  <p className="font-medium capitalize">{job.experience_level}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium capitalize">{job.job_type.replace('-', ' ')}</p>
                </div>
              </div>

              {job.department && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{job.department}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {job.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Posted Date</p>
                  <p className="font-medium">{formatDate(job.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(job.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Company Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-lg">{job.company?.name}</h4>
                {job.company?.domain && (
                  <a
                    href={`https://${job.company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {job.company.domain}
                  </a>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Company ID: {job.company_id}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}