import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCandidates } from '@/lib/data/candidates'
import { getJobs } from '@/lib/data/jobs'
import { getWorkflowExecutions } from '@/lib/data/workflows'
import type { CandidateWithApplications, JobWithCompany, WorkflowExecutionWithDetails } from '@/lib/types/database'
import { Users, Briefcase, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const [candidatesData, jobsData, workflowsData] = await Promise.all([
    getCandidates(),
    getJobs(),
    getWorkflowExecutions(),
  ])

  const stats = {
    totalCandidates: candidatesData.length,
    activeJobs: jobsData.filter(job => job.status === 'active').length,
    rejectedCandidates: candidatesData.filter(candidate =>
      candidate.applications.some(app => app.status === 'rejected')
    ).length,
    activeWorkflows: workflowsData.filter(workflow =>
      ['queued', 'parsing', 'retrieving', 'consolidating', 'analyzing'].includes(workflow.status)
    ).length,
    completedWorkflows: workflowsData.filter(workflow => workflow.status === 'completed').length,
  }

  const recentWorkflows = workflowsData.slice(0, 5)

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-left justify-between space-y-0 pb-2">
              
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              
            </CardHeader>
            <CardContent className='flex-1'>
              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.rejectedCandidates} rejected
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-left justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                {jobsData.length} total jobs
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-left justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedWorkflows} completed today
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-left justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflowsData.length > 0
                  ? Math.round((stats.completedWorkflows / workflowsData.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Workflow completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Candidates */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Candidates</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/candidates">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {candidatesData.length === 0 ? (
                <p className="text-gray-500">No candidates yet</p>
              ) : (
                <div className="space-y-4">
                  {candidatesData.slice(0, 5).map((candidate) => {
                    const latestApplication = candidate.applications[0]
                    return (
                      <div key={candidate.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                        <div className="text-right">
                          {latestApplication && (
                            <span className={`status-badge status-${latestApplication.status}`}>
                              {latestApplication.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Workflow Activity</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/workflows">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentWorkflows.length === 0 ? (
                <p className="text-gray-500">No workflow activity yet</p>
              ) : (
                <div className="space-y-4">
                  {recentWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{workflow.candidate.name}</p>
                        <p className="text-sm text-gray-600">
                          {workflow.rejected_job.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`status-badge status-${workflow.status}`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant={'outline'} className="h-auto p-4 flex-col btn-lift">
                <Link href="/candidates">
                  <Users className="w-10 h-10 mb-2" />
                  Manage Candidates
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col btn-lift">
                <Link href="/jobs">
                  <Briefcase className="w-10 h-10 mb-2" />
                  Manage Jobs
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col btn-lift">
                <Link href="/workflows">
                  <Activity className="w-10 h-10 mb-2" />
                  Monitor Workflows
                </Link>
              </Button>
            </div>
          
      </div>
    </LayoutWrapper>
  )
}