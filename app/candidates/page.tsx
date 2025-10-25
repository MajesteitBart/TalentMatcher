import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCandidates } from '@/lib/data/candidates'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Plus, Eye, ArrowRight } from 'lucide-react'

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </Button>
        </div>

        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first candidate to the system.
              </p>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Candidate</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {candidates.map((candidate) => {
              const latestApplication = candidate.applications[0]
              const hasRejection = candidate.applications.some(
                (app) => app.status === 'rejected'
              )

              return (
                <Card key={candidate.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <p className="text-gray-600">{candidate.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/candidates/${candidate.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        {hasRejection && (
                          <Button size="sm" asChild>
                            <Link href={`/candidates/${candidate.id}/matches`}>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              View Matches
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          CV Preview
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {candidate.cv_text}
                        </p>
                      </div>

                      {latestApplication && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Latest Application
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {latestApplication.job.title} at {latestApplication.job.department}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                latestApplication.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : latestApplication.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : latestApplication.status === 'interviewing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {latestApplication.status}
                            </span>
                          </div>
                          {latestApplication.rejection_reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {latestApplication.rejection_reason}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Added {formatDistanceToNow(new Date(candidate.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        <span>{candidate.applications.length} application(s)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}