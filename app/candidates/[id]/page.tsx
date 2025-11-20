import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCandidate } from '@/lib/data/candidates'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Briefcase, UserPlus, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CandidateApplications } from '@/components/candidates/candidate-applications'
import { AlternativeMatches } from '@/components/candidates/alternative-matches'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const candidate = await getCandidate(id)

  if (!candidate) {
    notFound()
  }

  const applicationCount = candidate.applications?.length || 0
  const hasAlternativeMatches = candidate.applications &&
    candidate.applications.some(app =>
      (app as any).workflow_executions &&
      (app as any).workflow_executions.some((exec: any) =>
        exec.alternative_jobs &&
        exec.alternative_jobs.length > 0
      )
    )

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Clean Header with Essential Info Only */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button size="sm" variant="ghost" asChild>
              <Link href="/candidates">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" asChild>
              <Link href={`/jobs?candidate=${candidate.id}`}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Application
              </Link>
            </Button>
          </div>
        </div>

        {/* Single-Source Candidate Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              {/* Clean Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-xl">
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Essential Information - No Duplication */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {candidate.name}
                  </h1>
                  <Badge variant={applicationCount > 0 ? "secondary" : "outline"} className="text-xs">
                    {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <>
                      <span>•</span>
                      <span>{candidate.phone}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Added {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}</span>
                  </div>
                  {candidate.linkedin_url && (
                    <div>
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Single Column Layout - Better Focus */}
        <div className="space-y-6">
          {/* Applications - Priority Content */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span>Applications</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Job applications and interview history
                  </CardDescription>
                </div>
                {applicationCount === 0 && (
                  <Button size="sm" asChild>
                    <Link href={`/jobs?candidate=${candidate.id}`}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Application
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {applicationCount > 0 ? (
                <CandidateApplications
                  applications={candidate.applications!}
                  candidate={candidate}
                />
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No applications yet</p>
                  <div className="flex justify-center space-x-3">
                    <Button asChild>
                      <Link href={`/jobs?candidate=${candidate.id}`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Application
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternative Matches - Priority Content */}
          {hasAlternativeMatches && (
            <AlternativeMatches
              matches={candidate.applications!
                .flatMap((app: any) => (app as any).workflow_executions || [])
                .flatMap((exec: any) => exec.alternative_jobs || [])
                .filter(job => job && job.jobs && job.jobs.id)
                .filter((job, index, self) =>
                  self.findIndex(j => j.jobs.id === job.jobs.id) === index
                )
                .map(job => ({
                  id: job.jobs.id,
                  title: job.jobs.title,
                  department: job.jobs.department,
                  location: job.jobs.location,
                  description: job.jobs.description,
                  composite_score: job?.composite_score || 0,
                  skills_score: job?.match_reasons?.skills,
                  experience_score: job?.match_reasons?.experience,
                  profile_score: job?.match_reasons?.profile
                }))}
              candidateName={candidate.name}
            />
          )}

          {/* CV Content - Simplified Card */}
          {candidate.cv_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Content</CardTitle>
                <CardDescription>
                  Full resume and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                    {candidate.cv_text}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}

