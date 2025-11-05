'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Database } from '@/lib/types/database'
import { Building2, Globe, Save, CheckCircle, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react'

type Company = Database['public']['Tables']['companies']['Row']

const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  domain: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

interface SettingsClientProps {
  initialCompanies: Company[]
  initialCompany: Company | null
}

export function SettingsClient({ initialCompanies, initialCompany }: SettingsClientProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(initialCompany)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const editForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  })

  const newCompanyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  })

  // Update form when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      editForm.reset({
        name: selectedCompany.name,
        domain: selectedCompany.domain || "",
      })
    }
  }, [selectedCompany, editForm])

  const openEditModal = (company: Company) => {
    setSelectedCompany(company)
    editForm.reset({
      name: company.name,
      domain: company.domain || "",
    })
    setIsEditModalOpen(true)
  }

  const openNewModal = () => {
    newCompanyForm.reset({
      name: "",
      domain: "",
    })
    setIsNewModalOpen(true)
  }

  const onEditSubmit = async (values: CompanyFormValues) => {
    if (!selectedCompany) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update company')
      }

      // Update local state
      setCompanies(prev =>
        prev.map(company =>
          company.id === selectedCompany.id
            ? { ...company, ...result.data }
            : company
        )
      )
      setSelectedCompany(result.data)
      setIsEditModalOpen(false)

      toast({
        title: "Company updated",
        description: "Company information has been successfully updated.",
      })

    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the company.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateSubmit = async (values: CompanyFormValues) => {
    setIsCreating(true)

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create company')
      }

      // Update local state
      setCompanies(prev => [...prev, result.data])

      // Select the new company
      setSelectedCompany(result.data)
      setIsNewModalOpen(false)
      newCompanyForm.reset()

      toast({
        title: "Company created",
        description: "New company has been successfully created.",
      })

    } catch (error) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "An error occurred while creating the company.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const formatCreatedAt = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your companies and system settings</p>
          </div>
          <Button onClick={openNewModal} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </Button>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first company to get started.
                </p>
                <Button onClick={openNewModal} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Company</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(company)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {company.domain && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{company.domain}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Created {formatCreatedAt(company.created_at)}
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {company.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Separator />

        {/* System Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mode</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {companies.length === 1 ? 'Single Company' : 'Multi-Company'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {companies.length === 1 ? 'Single company deployment' : 'Multiple companies supported'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Companies</Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Registered in the system
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>API Key Management</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Email Notification Preferences</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Workflow Configuration</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Company Logo Upload</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Company Modal */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span>Create New Company</span>
              </DialogTitle>
              <DialogDescription>
                Add a new company to manage job postings and candidates.
              </DialogDescription>
            </DialogHeader>
            <Form {...newCompanyForm}>
              <form onSubmit={newCompanyForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={newCompanyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official name of your company.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newCompanyForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        {`Your company's official website URL (optional).`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Company'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Company Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span>Edit Company</span>
              </DialogTitle>
              <DialogDescription>
                Update company information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official name of your company as it will appear in the system.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          {`Your company's official website URL (optional).`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-xs text-gray-500">
                    Company ID: {selectedCompany.id}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutWrapper>
  )
}