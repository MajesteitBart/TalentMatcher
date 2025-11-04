import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCandidate } from '@/lib/data/candidates'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Briefcase } from 'lucide-react'
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
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {candidate.name}
                  </h3>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.linkedin_url && (
                      <div className="text-sm">
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
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Added {formatDistanceToNow(new Date(candidate.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidateApplications
                  applications={candidate.applications}
                  candidate={candidate}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CV Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  
                  {candidate.cv_text}
               
                </div>
              </CardContent>
            </Card>

            {/* Alternative Job Matches */}
            {candidate.applications?.some(app =>
              app.workflow_executions?.some(exec =>
                exec.alternative_jobs && exec.alternative_jobs.length > 0
              )
            ) && (
              <AlternativeMatches
                matches={candidate.applications
                  .flatMap(app => app.workflow_executions || [])
                  .flatMap(exec => exec.alternative_jobs || [])
                  .filter((job, index, self) =>
                    self.findIndex(j => j.job.id === job.job.id) === index
                  )
                  .map(job => ({
                    ...job.job,
                    composite_score: job?.composite_score
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