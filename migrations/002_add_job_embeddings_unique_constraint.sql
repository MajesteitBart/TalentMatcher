-- ========================================
-- MIGRATION 002: Add Unique Constraint to Job Embeddings
-- ========================================
-- Run this in your Supabase SQL Editor
-- This fixes the ON CONFLICT specification issue

-- Add unique constraint for job_id and embedding_type combination
-- This allows the upsert operation in the indexing worker to work correctly
ALTER TABLE public.job_embeddings
ADD CONSTRAINT unique_job_embedding_type
UNIQUE (job_id, embedding_type);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_job_embedding_type ON public.job_embeddings
IS 'Ensures each job has only one embedding of each type (full, skills, experience)';