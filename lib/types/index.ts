// ========================================
// DATABASE TYPES (Auto-generated from Supabase)
// ========================================
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Company>
      }
      // ... other tables
    }
  }
}

// ========================================
// APPLICATION TYPES
// ========================================

export interface Company {
  id: string
  name: string
  domain: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  title: string
  description: string
  required_skills: string[]
  experience_level: 'junior' | 'mid' | 'senior' | 'lead'
  department: string | null
  location: string | null
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  status: 'active' | 'closed' | 'draft'
  created_at: string
  updated_at: string
}

export interface JobWithEmbeddings extends Job {
  embeddings: JobEmbedding[]
}

export interface JobEmbedding {
  id: string
  job_id: string
  embedding: number[]
  embedding_type: 'full' | 'skills' | 'experience'
  model_version: string
  created_at: string
}

export interface Candidate {
  id: string
  company_id: string
  name: string
  email: string
  cv_text: string
  cv_file_url: string | null
  phone: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

export interface ParsedCV {
  id: string
  candidate_id: string
  summary: string
  skills: string
  work_experience: string
  education: string
  languages: string[]
  certifications: string[]
  parsed_at: string
  parser_version: string
  validation_status: 'valid' | 'needs_review' | 'invalid'
  updated_at: string
}

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  status: 'pending' | 'reviewing' | 'interviewing' | 'rejected' | 'accepted'
  applied_at: string
  rejected_at: string | null
  rejection_reason: string | null
  updated_at: string
}

// ========================================
// LANGGRAPH WORKFLOW TYPES
// ========================================

export type WorkflowStatus = 
  | 'queued' 
  | 'parsing' 
  | 'retrieving' 
  | 'consolidating' 
  | 'analyzing' 
  | 'completed' 
  | 'failed'

export interface WorkflowState {
  // Input
  candidate_id: string
  rejected_application_id: string
  rejected_job_id: string
  raw_cv: string
  
  // Parsed Data
  parsed_cv: ParsedCV | null
  rejected_job_details: Job | null
  
  // Retrieval Results
  skills_matches: MatchResult[]
  experience_matches: MatchResult[]
  profile_matches: MatchResult[]
  
  // Consolidated
  consolidated_matches: ConsolidatedMatch[]
  
  // Final Output
  final_analysis: string
  
  // Metadata
  status: WorkflowStatus
  error: string | null
  current_node: string | null
  attempt_count: number
}

export interface MatchResult {
  job_id: string
  job_title: string
  job_description: string
  similarity_score: number
  match_source: 'skills' | 'experience' | 'profile'
}

export interface ConsolidatedMatch {
  job_id: string
  job_title: string
  job_description: string
  composite_score: number
  hit_count: number
  source_scores: {
    skills?: number
    experience?: number
    profile?: number
  }
  rank: number
}

export interface WorkflowExecution {
  id: string
  candidate_id: string
  rejected_application_id: string
  rejected_job_id: string
  status: WorkflowStatus
  state: WorkflowState
  final_analysis: string | null
  matched_job_ids: string[]
  error: string | null
  duration_ms: number | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  updated_at: string
}

export interface MatchResultDB {
  id: string
  workflow_execution_id: string
  job_id: string
  similarity_score: number
  composite_score: number
  match_source: 'skills' | 'experience' | 'profile'
  hit_count: number
  match_reasons: Record<string, any> | null
  rank: number
  created_at: string
}

// ========================================
// API TYPES
// ========================================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// ========================================
// GEMINI TYPES
// ========================================

export interface CVParseSchema {
  summary: string
  skills: string
  work_experience: string
  education: string
  languages?: string[]
  certifications?: string[]
}

export interface AnalysisPromptData {
  candidateName: string
  rejectedJobTitle: string
  parsed_cv: ParsedCV
  topMatches: ConsolidatedMatch[]
  matchedJobs: Job[]
}

// ========================================
// QUEUE TYPES
// ========================================

export interface WorkflowJobData {
  workflowExecutionId: string
  candidateId: string
  rejectedApplicationId: string
  rejectedJobId: string
  cvText: string
}

export interface IndexingJobData {
  jobIds: string[]
  companyId: string
}

// ========================================
// UTILITY TYPES
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
