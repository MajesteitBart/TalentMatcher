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
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 0.8) return 'success'
    if (score >= 0.6) return 'warning'
    return 'destructive'
  }

  return (
    <Card className="interactive-card shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <span className="text-xl font-semibold text-green-800">Better Job Matches</span>
            <p className="text-sm text-green-600 font-normal">For {candidateName}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {matches.map((job, index) => (
            <div
              key={job.id}
              className={`p-6 rounded-xl border-2 ${index === 0 ? 'border-green-200 bg-gradient-to-r from-green-50/30 to-emerald-50/30' : 'border-border bg-gradient-to-r from-background to-muted/10'} hover:shadow-md transition-all duration-200 hover:-translate-y-px`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-foreground">{job.title}</h4>
                    {index === 0 && (
                      <Badge variant="success" className="text-xs font-medium">
                        Best Match
                      </Badge>
                    )}
                  </div>
                  {job.department && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span>{job.department}</span>
                    </p>
                  )}
                  {job.location && (
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getScoreColor(job.composite_score)} font-bold text-sm px-3 py-1`}>
                    {formatScore(job.composite_score)}% Match
                  </Badge>
                  <Button size="sm" variant="outline" asChild className="hover:scale-105 transition-transform">
                    <Link href={`/jobs/${job.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Skills</span>
                  <span className="font-bold text-sm text-foreground">
                    {job.skills_score ? formatScore(job.skills_score) : 'N/A'}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Experience</span>
                  <span className="font-bold text-sm text-foreground">
                    {job.experience_score ? formatScore(job.experience_score) : 'N/A'}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Profile</span>
                  <span className="font-bold text-sm text-foreground">
                    {job.profile_score ? formatScore(job.profile_score) : 'N/A'}%
                  </span>
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
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