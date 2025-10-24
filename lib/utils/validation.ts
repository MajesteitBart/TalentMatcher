import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format')
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const urlSchema = z.string().url('Invalid URL format')

// Candidate validation
export const createCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  cv_text: z.string().min(100, 'CV must be at least 100 characters'),
  phone: z.string().optional(),
  linkedin_url: urlSchema.optional(),
  company_id: uuidSchema,
})

// Job validation
export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  required_skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']),
  department: z.string().optional(),
  location: z.string().optional(),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  status: z.enum(['active', 'closed', 'draft']).default('active'),
  company_id: uuidSchema,
})

// Application validation
export const createApplicationSchema = z.object({
  candidate_id: uuidSchema,
  job_id: uuidSchema,
})

export const rejectApplicationSchema = z.object({
  application_id: uuidSchema,
  rejection_reason: z.string().optional(),
})
