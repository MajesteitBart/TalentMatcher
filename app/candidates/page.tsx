import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getCandidates } from '@/lib/data/candidates'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Plus, Eye, ArrowRight, Mail, Phone, Building, Calendar, Search, Filter, Users } from 'lucide-react'
import { CandidateSearchClient } from '@/components/candidates/candidate-search-client'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Candidates</h1>
            <p className="text-lg text-muted-foreground mt-2">Manage and track candidate applications</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <Users className="w-4 h-4 inline mr-2" />
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </div>
            <Button asChild className="flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all duration-200">
              <Link href="/candidates/add">
                <Plus className="w-4 h-4" />
                <span>Add Candidate</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <CandidateSearchClient candidates={candidates} />

       
      </div>
    </LayoutWrapper>
  )
}