import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCandidate } from '@/lib/data/candidates'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Briefcase, Plus, UserPlus } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CandidateApplications } from '@/components/candidates/candidate-applications'
import { AlternativeMatches } from '@/components/candidates/alternative-matches'
import { Badge } from '@/components/ui/badge'

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

  console.log('Fetched candidate:', JSON.stringify(candidate?.applications, null, 2))

  if (!candidate) {
    notFound()
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button size="sm" asChild>
            <Link href="/candidates">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Candidate Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  {candidate.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.linkedin_url && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Added {formatDistanceToNow(new Date(candidate.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/candidates">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Candidates
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href={`/jobs?candidate=${id}`}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Application
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/jobs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job for Candidate
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applications Section */}
            <Card id="applications-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <CardTitle>Applications</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/jobs?candidate=${id}`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Application
                      </Link>
                    </Button>
                    <Badge variant="secondary">
                      {candidate.applications?.length || 0} application{(candidate.applications?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Job applications and interview history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidate.applications && candidate.applications.length > 0 ? (
                  <CandidateApplications
                    applications={candidate.applications}
                    candidate={candidate}
                  />
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <div className="flex justify-center gap-3">
                      <Button className="mt-4" asChild>
                        <Link href={`/jobs?candidate=${id}`}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Application
                        </Link>
                      </Button>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CV Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium">CV</span>
                  </div>
                  Resume Content
                </CardTitle>
                <CardDescription>
                  Full resume and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
                    <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                      {candidate.cv_text || 'No CV content available'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Job Matches */}
            {candidate.applications && candidate.applications.length > 0 && candidate.applications.some(app =>
              (app as any).workflow_executions && (app as any).workflow_executions.some((exec: any) =>
                exec.alternative_jobs && exec.alternative_jobs.length > 0
              )
            ) && (
              <AlternativeMatches
                matches={candidate.applications
                  .flatMap((app: any) => (app as any).workflow_executions || [])
                  .flatMap((exec: any) => exec.alternative_jobs || [])
                  .filter(job => job && job.jobs && job.jobs.id) // Filter out invalid items
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
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}