'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Star,
  TrendingUp,
  Briefcase,
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface MatchResultsTableProps {
  matches: any[]
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export function MatchResultsTable({ matches }: MatchResultsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'composite_score', direction: 'desc' })
  const [filterSource, setFilterSource] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter matches
  const filteredMatches = matches.filter(match => {
    const matchesSearch = searchTerm === '' ||
      match.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.job.department?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSource = filterSource === 'all' || match.match_source === filterSource

    return matchesSearch && matchesSource
  })

  // Sort matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortConfig.key) {
      case 'composite_score':
        aValue = a.composite_score
        bValue = b.composite_score
        break
      case 'similarity_score':
        aValue = a.similarity_score
        bValue = b.similarity_score
        break
      case 'hit_count':
        aValue = a.hit_count
        bValue = b.hit_count
        break
      case 'rank':
        aValue = a.rank || 999
        bValue = b.rank || 999
        break
      case 'job_title':
        aValue = a.job.title.toLowerCase()
        bValue = b.job.title.toLowerCase()
        break
      case 'company_name':
        aValue = a.job.company?.name?.toLowerCase() || ''
        bValue = b.job.company?.name?.toLowerCase() || ''
        break
      default:
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const toggleRowExpansion = (matchId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(matchId)) {
        newSet.delete(matchId)
      } else {
        newSet.add(matchId)
      }
      return newSet
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'skills':
        return 'bg-purple-100 text-purple-800'
      case 'experience':
        return 'bg-blue-100 text-blue-800'
      case 'profile':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  const uniqueSources = Array.from(new Set(matches.map(m => m.match_source)))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by job title, company, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-40"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {sortedMatches.length} of {matches.length} matches
        </span>
        <div className="flex items-center space-x-4">
          <span>By match source:</span>
          {uniqueSources.map(source => {
            const count = matches.filter(m => m.match_source === source).length
            return (
              <Badge key={source} className={getSourceColor(source)}>
                {source}: {count}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('job_title')}
                  className="font-semibold"
                >
                  Job Title
                  {sortConfig.key === 'job_title' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('company_name')}
                  className="font-semibold"
                >
                  Company
                  {sortConfig.key === 'company_name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Details</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('composite_score')}
                  className="font-semibold"
                >
                  Score
                  {sortConfig.key === 'composite_score' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('hit_count')}
                  className="font-semibold"
                >
                  Matches
                  {sortConfig.key === 'hit_count' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMatches.map((match) => (
              <>
                <TableRow key={match.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {match.job.title}
                      </div>
                      {match.rank && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">Rank #{match.rank}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{match.job.company?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {match.job.department && (
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span>{match.job.department}</span>
                        </div>
                      )}
                      {match.job.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{match.job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{match.job.job_type}</Badge>
                        <Badge variant="outline">{match.job.experience_level}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(match.composite_score)}`}>
                        {formatScore(match.composite_score)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Similarity: {formatScore(match.similarity_score)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSourceColor(match.match_source)}>
                      {match.match_source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {match.hit_count} hits
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRowExpansion(match.id)}
                      >
                        {expandedRows.has(match.id) ? 'Hide' : 'Details'}
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/jobs/${match.job.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Row */}
                {expandedRows.has(match.id) && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-50">
                      <div className="py-4 space-y-4">
                        {/* Job Description */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto bg-white p-3 rounded border">
                            {match.job.description.substring(0, 500)}
                            {match.job.description.length > 500 && '...'}
                          </div>
                        </div>

                        {/* Required Skills */}
                        {match.job.required_skills && match.job.required_skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {match.job.required_skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Match Reasons */}
                        {match.match_reasons && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Match Analysis</h4>
                            <div className="bg-white p-3 rounded border">
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(match.match_reasons, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border">
                            <div className="text-gray-500">Composite Score</div>
                            <div className="font-semibold text-green-600">
                              {formatScore(match.composite_score)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-gray-500">Similarity Score</div>
                            <div className="font-semibold text-blue-600">
                              {formatScore(match.similarity_score)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-gray-500">Hit Count</div>
                            <div className="font-semibold text-purple-600">
                              {match.hit_count}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-gray-500">Match Source</div>
                            <div className="font-semibold">
                              <Badge className={getSourceColor(match.match_source)}>
                                {match.match_source}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedMatches.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">
              {searchTerm || filterSource !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'This workflow didn\'t find any matching jobs'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}