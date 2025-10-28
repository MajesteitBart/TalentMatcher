import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface AlternativeJob {
  id: string
  title: string
  department?: string
  location?: string
  description?: string
  composite_score: number
  skills_score?: number
  experience_score?: number
  profile_score?: number
}

interface AlternativeMatchesProps {
  matches: AlternativeJob[]
  candidateName: string
}

export function AlternativeMatches({ matches, candidateName }: AlternativeMatchesProps) {
  if (!matches || matches.length === 0) {
    return null
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-orange-100 text-orange-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Better Job Matches for {candidateName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{job.title}</h4>
                  {job.department && (
                    <p className="text-sm text-gray-600 mt-1">{job.department}</p>
                  )}
                  {job.location && (
                    <p className="text-sm text-gray-600">{job.location}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getScoreColor(job.composite_score)}>
                    {formatScore(job.composite_score)}% Match
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-500">Skills:</span>
                  <span className="font-medium">
                    {job.skills_score ? formatScore(job.skills_score) : 'N/A'}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-500">Experience:</span>
                  <span className="font-medium">
                    {job.experience_score ? formatScore(job.experience_score) : 'N/A'}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-500">Profile:</span>
                  <span className="font-medium">
                    {job.profile_score ? formatScore(job.profile_score) : 'N/A'}%
                  </span>
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-gray-700 line-clamp-2">
                  {job.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}