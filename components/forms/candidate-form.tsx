'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { CandidateWithApplications } from '@/lib/types/database'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FormErrors {
  company_id?: string
  name?: string
  email?: string
  cv_text?: string
  cv_file_url?: string
  phone?: string
  linkedin_url?: string
}

interface CandidateFormData {
  company_id: string
  name: string
  email: string
  cv_text: string
  cv_file_url: string
  phone: string
  linkedin_url: string
}

interface CandidateFormProps {
  candidate?: CandidateWithApplications
  companies: Array<{ id: string; name: string; domain: string | null }>
}

export function CandidateForm({ candidate, companies }: CandidateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState<CandidateFormData>({
    company_id: candidate?.company_id || companies[0]?.id || '',
    name: candidate?.name || '',
    email: candidate?.email || '',
    cv_text: candidate?.cv_text || '',
    cv_file_url: candidate?.cv_file_url || '',
    phone: candidate?.phone || '',
    linkedin_url: candidate?.linkedin_url || ''
  })

  const validateField = (field: keyof CandidateFormData, value: string): string | undefined => {
    switch (field) {
      case 'company_id':
        if (!value) return 'Please select a company'
        break
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (value.trim().length > 100) return 'Name must be less than 100 characters'
        break
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        break
      case 'cv_text':
        if (!value.trim()) return 'CV text is required'
        if (value.trim().length < 50) return 'CV text must be at least 50 characters'
        break
      case 'phone':
        if (value && !/^[+]?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        break
      case 'linkedin_url':
        if (value && !value.startsWith('https://linkedin.com/')) {
          return 'LinkedIn URL must start with https://linkedin.com/'
        }
        break
      case 'cv_file_url':
        if (value) {
          try {
            new URL(value)
          } catch {
            return 'Please enter a valid URL'
          }
        }
        break
    }
  }

  const handleInputChange = (field: keyof CandidateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)

    // Validate field on change
    const fieldError = validateField(field, value)
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }))
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Validate all required fields
    Object.keys(formData).forEach((field) => {
      const fieldKey = field as keyof CandidateFormData
      const error = validateField(fieldKey, formData[fieldKey])
      if (error) {
        errors[fieldKey] = error
        isValid = false
      }
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For now, just simulate file upload by reading the file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        handleInputChange('cv_text', text)
        setSuccess('CV uploaded successfully!')
      }
      reader.onerror = () => {
        setError('Failed to read file')
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = candidate ? `/api/candidates/${candidate.id}` : '/api/candidates'
      const method = candidate ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save candidate')
      }

      setSuccess(candidate ? 'Candidate updated successfully!' : 'Candidate created successfully!')

      // Redirect to candidates page after a short delay
      setTimeout(() => {
        router.push('/candidates')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (companies.length === 0) {
    return (
      <LayoutWrapper>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Companies Available
              </h3>
              <p className="text-gray-600">
                You need to create a company before you can add candidates.
              </p>
            </CardContent>
          </Card>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button size="sm" asChild>
              <Link href="/candidates">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Candidates
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {candidate ? 'Edit Candidate' : 'Add New Candidate'}
            </h1>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <p className="text-green-800 text-sm">{success}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection */}
              <div>
                <Label htmlFor="company_id" className={fieldErrors.company_id ? 'text-destructive' : ''}>
                  Company *
                </Label>
                <Select
                  id="company_id"
                  value={formData.company_id}
                  onChange={(e) => handleInputChange('company_id', e.target.value)}
                  required
                  disabled={!!candidate}
                  className={fieldErrors.company_id ? 'border-destructive focus:ring-destructive' : ''}
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
                {fieldErrors.company_id && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.company_id}</p>
                )}
                {candidate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Company cannot be changed after candidate creation
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className={fieldErrors.name ? 'text-destructive' : ''}>
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className={fieldErrors.name ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className={fieldErrors.email ? 'text-destructive' : ''}>
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. john@example.com"
                    required
                    className={fieldErrors.email ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className={fieldErrors.phone ? 'text-destructive' : ''}>
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. +1 (555) 123-4567"
                    className={fieldErrors.phone ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {fieldErrors.phone && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div>
                  <Label htmlFor="linkedin_url" className={fieldErrors.linkedin_url ? 'text-destructive' : ''}>
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/johndoe"
                    className={fieldErrors.linkedin_url ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {fieldErrors.linkedin_url && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.linkedin_url}</p>
                  )}
                </div>
              </div>

              {/* CV Text */}
              <div>
                <Label htmlFor="cv_text" className={fieldErrors.cv_text ? 'text-destructive' : ''}>
                  CV Text *
                </Label>
                <Textarea
                  id="cv_text"
                  value={formData.cv_text}
                  onChange={(e) => handleInputChange('cv_text', e.target.value)}
                  placeholder="Paste the candidate's CV text here or upload a file below..."
                  rows={8}
                  required
                  className={fieldErrors.cv_text ? 'border-destructive focus:ring-destructive' : ''}
                />
                {fieldErrors.cv_text && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.cv_text}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  You can either paste the CV text directly or upload a text file below.
                </p>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="cv_file">Upload CV File (Optional)</Label>
                <div className="mt-2">
                  <Input
                    id="cv_file"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: .txt, .pdf, .doc, .docx. Text files will be read automatically.
                  </p>
                </div>
              </div>

              {/* CV File URL */}
              <div>
                <Label htmlFor="cv_file_url" className={fieldErrors.cv_file_url ? 'text-destructive' : ''}>
                  CV File URL (Optional)
                </Label>
                <Input
                  id="cv_file_url"
                  type="url"
                  value={formData.cv_file_url}
                  onChange={(e) => handleInputChange('cv_file_url', e.target.value)}
                  placeholder="e.g. https://example.com/cv.pdf"
                  className={fieldErrors.cv_file_url ? 'border-destructive focus:ring-destructive' : ''}
                />
                {fieldErrors.cv_file_url && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.cv_file_url}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  URL to the candidate&apos;s CV file if hosted elsewhere.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" asChild>
                  <Link href="/candidates">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : (candidate ? 'Update Candidate' : 'Add Candidate')}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}