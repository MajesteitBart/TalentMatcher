-- ========================================
-- MIGRATION 001: Initial Schema
-- ========================================
-- Run this in your Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ========================================
-- COMPANIES
-- ========================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table public.companies enable row level security;

create policy "Companies are viewable by authenticated users"
  on public.companies for select
  to authenticated
  using (true);

-- ========================================
-- JOBS
-- ========================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  required_skills text[] not null default '{}',
  experience_level text not null,
  department text,
  location text,
  job_type text not null check (job_type in ('full-time', 'part-time', 'contract', 'internship')),
  status text not null default 'active' check (status in ('active', 'closed', 'draft')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_jobs_company_id on public.jobs(company_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_created_at on public.jobs(created_at desc);

alter table public.jobs enable row level security;

create policy "Jobs are viewable by authenticated users"
  on public.jobs for select
  to authenticated
  using (true);

-- ========================================
-- JOB EMBEDDINGS (pgvector)
-- ========================================
create table public.job_embeddings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  embedding vector(768),  -- Gemini text-embedding-004 dimension
  embedding_type text not null check (embedding_type in ('full', 'skills', 'experience')),
  model_version text not null default 'text-embedding-004',
  created_at timestamptz default now()
);

-- Create HNSW index for fast similarity search
create index on public.job_embeddings 
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index idx_job_embeddings_job_id on public.job_embeddings(job_id);
create index idx_job_embeddings_type on public.job_embeddings(embedding_type);

-- Add unique constraint for upsert operations
alter table public.job_embeddings
add constraint unique_job_embedding_type
unique (job_id, embedding_type);

alter table public.job_embeddings enable row level security;

create policy "Job embeddings are viewable by authenticated users"
  on public.job_embeddings for select
  to authenticated
  using (true);

-- ========================================
-- CANDIDATES
-- ========================================
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  cv_text text not null,
  cv_file_url text,
  phone text,
  linkedin_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_candidates_company_id on public.candidates(company_id);
create index idx_candidates_email on public.candidates(email);
create index idx_candidates_created_at on public.candidates(created_at desc);

alter table public.candidates enable row level security;

create policy "Candidates are viewable by authenticated users"
  on public.candidates for select
  to authenticated
  using (true);

-- ========================================
-- PARSED CVS
-- ========================================
create table public.parsed_cvs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.candidates(id) on delete cascade,
  summary text not null,
  skills text not null,
  work_experience text not null,
  education text not null,
  languages text[] default '{}',
  certifications text[] default '{}',
  parsed_at timestamptz default now(),
  parser_version text not null default 'gemini-2.0-flash',
  validation_status text default 'valid' check (validation_status in ('valid', 'needs_review', 'invalid')),
  updated_at timestamptz default now()
);

create index idx_parsed_cvs_candidate_id on public.parsed_cvs(candidate_id);

alter table public.parsed_cvs enable row level security;

create policy "Parsed CVs are viewable by authenticated users"
  on public.parsed_cvs for select
  to authenticated
  using (true);

-- ========================================
-- APPLICATIONS (Candidate applied to Job)
-- ========================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'reviewing', 'interviewing', 'rejected', 'accepted')
  ),
  applied_at timestamptz default now(),
  rejected_at timestamptz,
  rejection_reason text,
  updated_at timestamptz default now(),
  
  unique(candidate_id, job_id)
);

create index idx_applications_candidate_id on public.applications(candidate_id);
create index idx_applications_job_id on public.applications(job_id);
create index idx_applications_status on public.applications(status);

alter table public.applications enable row level security;

create policy "Applications are viewable by authenticated users"
  on public.applications for select
  to authenticated
  using (true);

-- ========================================
-- WORKFLOW EXECUTIONS (LangGraph runs)
-- ========================================
create table public.workflow_executions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  rejected_application_id uuid not null references public.applications(id) on delete cascade,
  rejected_job_id uuid not null references public.jobs(id),
  status text not null default 'queued' check (
    status in ('queued', 'parsing', 'retrieving', 'consolidating', 'analyzing', 'completed', 'failed')
  ),
  state jsonb not null default '{}',
  final_analysis text,
  matched_job_ids uuid[],
  error text,
  duration_ms integer,
  created_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz default now()
);

create index idx_workflow_executions_candidate_id on public.workflow_executions(candidate_id);
create index idx_workflow_executions_status on public.workflow_executions(status);
create index idx_workflow_executions_created_at on public.workflow_executions(created_at desc);

alter table public.workflow_executions enable row level security;

create policy "Workflow executions are viewable by authenticated users"
  on public.workflow_executions for select
  to authenticated
  using (true);

-- ========================================
-- MATCH RESULTS
-- ========================================
create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  workflow_execution_id uuid not null references public.workflow_executions(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  similarity_score float not null check (similarity_score >= 0 and similarity_score <= 1),
  composite_score float not null,
  match_source text not null check (match_source in ('skills', 'experience', 'profile')),
  hit_count integer not null default 1,
  match_reasons jsonb,
  rank integer,
  created_at timestamptz default now()
);

create index idx_match_results_workflow_id on public.match_results(workflow_execution_id);
create index idx_match_results_job_id on public.match_results(job_id);
create index idx_match_results_composite_score on public.match_results(composite_score desc);

alter table public.match_results enable row level security;

create policy "Match results are viewable by authenticated users"
  on public.match_results for select
  to authenticated
  using (true);

-- ========================================
-- FUNCTIONS FOR VECTOR SEARCH
-- ========================================

-- Search similar jobs by embedding
create or replace function match_jobs(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 10,
  filter_type text default 'full'
)
returns table (
  job_id uuid,
  similarity float,
  job_title text,
  job_description text
)
language plpgsql
as $$
begin
  return query
  select
    je.job_id,
    1 - (je.embedding <=> query_embedding) as similarity,
    j.title as job_title,
    j.description as job_description
  from job_embeddings je
  inner join jobs j on je.job_id = j.id
  where 
    je.embedding_type = filter_type
    and j.status = 'active'
    and 1 - (je.embedding <=> query_embedding) > match_threshold
  order by je.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ========================================
-- TRIGGERS FOR updated_at
-- ========================================

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on companies
  for each row execute procedure trigger_set_updated_at();

create trigger set_updated_at before update on jobs
  for each row execute procedure trigger_set_updated_at();

create trigger set_updated_at before update on candidates
  for each row execute procedure trigger_set_updated_at();

create trigger set_updated_at before update on parsed_cvs
  for each row execute procedure trigger_set_updated_at();

create trigger set_updated_at before update on applications
  for each row execute procedure trigger_set_updated_at();

create trigger set_updated_at before update on workflow_executions
  for each row execute procedure trigger_set_updated_at();

-- ========================================
-- SEED DATA (for development)
-- ========================================

-- Insert demo company
insert into companies (id, name, domain) 
values 
  ('00000000-0000-0000-0000-000000000001', 'Demo Company BV', 'demo.nl');

-- Insert sample jobs (will add more via script)
insert into jobs (company_id, title, description, required_skills, experience_level, job_type, status)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Senior Frontend Developer',
    'We are looking for an experienced frontend developer with React and TypeScript expertise...',
    ARRAY['React', 'TypeScript', 'CSS', 'Next.js'],
    'senior',
    'full-time',
    'active'
  );
