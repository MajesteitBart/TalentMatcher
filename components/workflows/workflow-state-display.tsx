'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Code, FileText, User, Briefcase, Brain, Search } from 'lucide-react'

interface WorkflowStateDisplayProps {
  title: string
  data: any
  defaultExpanded?: boolean
  showRaw?: boolean
}

interface StateSection {
  key: string
  title: string
  icon: React.ReactNode
  description?: string
  transform?: (data: any) => any
}

export function WorkflowStateDisplay({
  title,
  data,
  defaultExpanded = true,
  showRaw = false
}: WorkflowStateDisplayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const getStateSections = (): StateSection[] => {
    if (title === 'Parsed CV') {
      return [
        {
          key: 'personal_info',
          title: 'Personal Information',
          icon: <User className="w-4 h-4" />,
          description: 'Basic candidate information extracted from CV'
        },
        {
          key: 'skills',
          title: 'Skills',
          icon: <Brain className="w-4 h-4" />,
          description: 'Technical and soft skills identified'
        },
        {
          key: 'experience',
          title: 'Experience',
          icon: <Briefcase className="w-4 h-4" />,
          description: 'Work experience history'
        },
        {
          key: 'education',
          title: 'Education',
          icon: <FileText className="w-4 h-4" />,
          description: 'Educational background'
        }
      ]
    }

    if (title === 'Complete State') {
      const sections: StateSection[] = []

      if (data.parsed_cv) {
        sections.push({
          key: 'parsed_cv',
          title: 'Parsed CV Data',
          icon: <User className="w-4 h-4" />,
          description: 'Structured CV data extracted by AI'
        })
      }

      if (data.skills_matches) {
        sections.push({
          key: 'skills_matches',
          title: 'Skills Search Results',
          icon: <Search className="w-4 h-4" />,
          description: 'Jobs matched based on skills (40% weight)'
        })
      }

      if (data.experience_matches) {
        sections.push({
          key: 'experience_matches',
          title: 'Experience Search Results',
          icon: <Search className="w-4 h-4" />,
          description: 'Jobs matched based on experience (35% weight)'
        })
      }

      if (data.profile_matches) {
        sections.push({
          key: 'profile_matches',
          title: 'Profile Search Results',
          icon: <Search className="w-4 h-4" />,
          description: 'Jobs matched based on overall profile (25% weight)'
        })
      }

      if (data.consolidated_matches) {
        sections.push({
          key: 'consolidated_matches',
          title: 'Consolidated Matches',
          icon: <Brain className="w-4 h-4" />,
          description: 'Merged and ranked results from all searches'
        })
      }

      if (data.error) {
        sections.push({
          key: 'error',
          title: 'Error Information',
          icon: <Code className="w-4 h-4" />,
          description: 'Error details if workflow failed'
        })
      }

      return sections
    }

    return []
  }

  const sections = getStateSections()

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey)
      } else {
        newSet.add(sectionKey)
      }
      return newSet
    })
  }

  const renderValue = (value: any, key: string = ''): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>
    }

    if (typeof value === 'number') {
      return <span className="font-mono text-blue-600">{value}</span>
    }

    if (typeof value === 'string') {
      if (value.length > 200 && !expandedSections.has(key)) {
        return (
          <div>
            <span>{value.substring(0, 200)}...</span>
            <Button
              size="sm"
              variant="link"
              onClick={() => toggleSection(key)}
              className="ml-2 p-0 h-auto"
            >
              Show more
            </Button>
          </div>
        )
      }
      return <span className="text-gray-700">{value}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">Empty array</span>
      }

      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500 mb-1">Array ({value.length} items)</div>
          <div className="pl-4 border-l-2 border-gray-200">
            {value.slice(0, expandedSections.has(key) ? value.length : 3).map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-sm text-gray-600 mr-2">[{index}]:</span>
                {renderValue(item, `${key}[${index}]`)}
              </div>
            ))}
            {value.length > 3 && !expandedSections.has(key) && (
              <Button
                size="sm"
                variant="link"
                onClick={() => toggleSection(key)}
                className="mt-2 p-0 h-auto"
              >
                Show {value.length - 3} more items
              </Button>
            )}
          </div>
        </div>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        return <span className="text-gray-400 italic">Empty object</span>
      }

      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500 mb-1">Object ({keys.length} properties)</div>
          <div className="pl-4 border-l-2 border-gray-200">
            {keys.slice(0, expandedSections.has(key) ? keys.length : 5).map(subKey => (
              <div key={subKey} className="py-1">
                <span className="text-sm font-medium text-gray-700 mr-2">{subKey}:</span>
                {renderValue(value[subKey], `${key}.${subKey}`)}
              </div>
            ))}
            {keys.length > 5 && !expandedSections.has(key) && (
              <Button
                size="sm"
                variant="link"
                onClick={() => toggleSection(key)}
                className="mt-2 p-0 h-auto"
              >
                Show {keys.length - 5} more properties
              </Button>
            )}
          </div>
        </div>
      )
    }

    return <span className="text-gray-700">{String(value)}</span>
  }

  const renderSection = (section: StateSection) => {
    const sectionData = data[section.key]
    const isExpanded = expandedSections.has(section.key)

    if (!sectionData) return null

    return (
      <div key={section.key} className="border rounded-lg">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          onClick={() => toggleSection(section.key)}
        >
          <div className="flex items-center space-x-2">
            {section.icon}
            <span className="font-medium">{section.title}</span>
            {section.description && (
              <span className="text-sm text-gray-500">- {section.description}</span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              {renderValue(sectionData, section.key)}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (showRaw) {
    return (
      <>
        <span>{title} - Raw JSON</span>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
      </>
    )
  }

  return (
    <>
          

          {sections.length > 0 ? (
            <div className="space-y-3">
              {sections.map(renderSection)}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              {renderValue(data)}
            </div>
          )}

          {/* Quick Stats */}
          {title === 'Parsed CV' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {data.skills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {data.experience?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {data.education?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Education</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {data.email ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Email Found</div>
              </div>
            </div>
          )}

      
      </>
  )
}