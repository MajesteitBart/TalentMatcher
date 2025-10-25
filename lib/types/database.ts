// Database types generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          required_skills: string[];
          experience_level: string;
          department: string | null;
          location: string | null;
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
          status: 'active' | 'closed' | 'draft';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description: string;
          required_skills?: string[];
          experience_level: string;
          department?: string | null;
          location?: string | null;
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
          status?: 'active' | 'closed' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string;
          required_skills?: string[];
          experience_level?: string;
          department?: string | null;
          location?: string | null;
          job_type?: 'full-time' | 'part-time' | 'contract' | 'internship';
          status?: 'active' | 'closed' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          cv_text: string;
          cv_file_url: string | null;
          phone: string | null;
          linkedin_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          email: string;
          cv_text: string;
          cv_file_url?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          email?: string;
          cv_text?: string;
          cv_file_url?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          status: 'pending' | 'reviewing' | 'interviewing' | 'rejected' | 'accepted';
          applied_at: string;
          rejected_at: string | null;
          rejection_reason: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          status?: 'pending' | 'reviewing' | 'interviewing' | 'rejected' | 'accepted';
          applied_at?: string;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: 'pending' | 'reviewing' | 'interviewing' | 'rejected' | 'accepted';
          applied_at?: string;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
      };
      workflow_executions: {
        Row: {
          id: string;
          candidate_id: string;
          rejected_application_id: string;
          rejected_job_id: string;
          status: 'queued' | 'parsing' | 'retrieving' | 'consolidating' | 'analyzing' | 'completed' | 'failed';
          state: Record<string, any>;
          final_analysis: string | null;
          matched_job_ids: string[] | null;
          error: string | null;
          duration_ms: number | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          rejected_application_id: string;
          rejected_job_id: string;
          status?: 'queued' | 'parsing' | 'retrieving' | 'consolidating' | 'analyzing' | 'completed' | 'failed';
          state?: Record<string, any>;
          final_analysis?: string | null;
          matched_job_ids?: string[] | null;
          error?: string | null;
          duration_ms?: number | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          rejected_application_id?: string;
          rejected_job_id?: string;
          status?: 'queued' | 'parsing' | 'retrieving' | 'consolidating' | 'analyzing' | 'completed' | 'failed';
          state?: Record<string, any>;
          final_analysis?: string | null;
          matched_job_ids?: string[] | null;
          error?: string | null;
          duration_ms?: number | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      match_results: {
        Row: {
          id: string;
          workflow_execution_id: string;
          job_id: string;
          similarity_score: number;
          composite_score: number;
          match_source: 'skills' | 'experience' | 'profile';
          hit_count: number;
          match_reasons: Record<string, any> | null;
          rank: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_execution_id: string;
          job_id: string;
          similarity_score: number;
          composite_score: number;
          match_source: 'skills' | 'experience' | 'profile';
          hit_count?: number;
          match_reasons?: Record<string, any> | null;
          rank?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_execution_id?: string;
          job_id?: string;
          similarity_score?: number;
          composite_score?: number;
          match_source?: 'skills' | 'experience' | 'profile';
          hit_count?: number;
          match_reasons?: Record<string, any> | null;
          rank?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Common joined types for frontend usage
export type CandidateWithApplications = Database['public']['Tables']['candidates']['Row'] & {
  applications: (Database['public']['Tables']['applications']['Row'] & {
    job: Database['public']['Tables']['jobs']['Row'];
  })[];
};

export type JobWithCompany = Database['public']['Tables']['jobs']['Row'] & {
  company: Database['public']['Tables']['companies']['Row'];
};

export type WorkflowExecutionWithDetails = Database['public']['Tables']['workflow_executions']['Row'] & {
  candidate: Database['public']['Tables']['candidates']['Row'];
  rejected_job: Database['public']['Tables']['jobs']['Row'];
  match_results?: (Database['public']['Tables']['match_results']['Row'] & {
    job: Database['public']['Tables']['jobs']['Row'];
  })[];
};