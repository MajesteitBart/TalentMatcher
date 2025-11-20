import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Alternative Job Matches</CardTitle>
            <CardDescription className="text-sm">For {candidateName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {matches.slice(0, 3).map((job, index) => (
            <div
              key={job.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                index === 0
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                        Best Match
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {job.department && <span>{job.department}</span>}
                    {job.location && job.department && <span>•</span>}
                    {job.location && <span>{job.location}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant={getScoreVariant(job.composite_score)} className="text-xs font-medium">
                    {formatScore(job.composite_score)}% match
                  </Badge>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <ExternalLink className="w-4 h-4" />
                      <span className="sr-only">View Job</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Simplified Score Breakdown */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Skills: {job.skills_score ? formatScore(job.skills_score) : 'N/A'}%</span>
                <span>Experience: {job.experience_score ? formatScore(job.experience_score) : 'N/A'}%</span>
                <span>Profile: {job.profile_score ? formatScore(job.profile_score) : 'N/A'}%</span>
              </div>

              {job.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              )}
            </div>
          ))}

          {matches.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="text-xs">
                View {matches.length - 3} more matches
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}