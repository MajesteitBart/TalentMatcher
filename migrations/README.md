# Database Migrations

This directory contains SQL migration files for the Talent Matcher database.

## Applying Migrations

### For Existing Database (Fix Current Issue)

If you have an existing database and need to fix the missing unique constraint issue:

1. **Option 1: Quick Fix (Recommended for Development)**
   ```sql
   -- Copy and paste this into your Supabase SQL Editor
   ALTER TABLE public.job_embeddings
   ADD CONSTRAINT unique_job_embedding_type
   UNIQUE (job_id, embedding_type);
   ```

2. **Option 2: Run Migration File**
   ```bash
   # Copy the contents of 002_add_job_embeddings_unique_constraint.sql
   # and run it in your Supabase SQL Editor
   ```

### For New Database

Run the migrations in order:
1. `../supabase-migration.sql` - Initial schema
2. `002_add_job_embeddings_unique_constraint.sql` - Fix missing constraint (optional if you updated the main file)

## Migration History

### 001: Initial Schema (`../supabase-migration.sql`)
- Creates all tables: companies, jobs, job_embeddings, candidates, parsed_cvs, applications, workflow_executions, match_results
- Sets up pgvector extension and HNSW indexes
- Creates RLS policies
- Includes seed data

### 002: Add Unique Constraint to Job Embeddings (`002_add_job_embeddings_unique_constraint.sql`)
- **Purpose**: Fixes the ON CONFLICT specification error in the indexing worker
- **Problem**: The `storeJobEmbeddings` function uses upsert with `onConflict: 'job_id,embedding_type'` but the constraint didn't exist
- **Solution**: Adds unique constraint on `(job_id, embedding_type)` combination
- **Impact**: Allows job indexing to work correctly and store embeddings in the database

## Verification

After applying the fix, you can verify the job indexing works:

```bash
# Make sure indexing worker is running
npm run worker:indexing

# Test the indexing endpoint
curl -X POST http://localhost:3000/api/jobs/index \
  -H "Content-Type: application/json" \
  -d '{"company_id": "00000000-0000-0000-0000-000000000001"}'
```

You should see:
- API call succeeds
- No error messages in the worker logs
- Embeddings are generated and stored in the database

## Troubleshooting

### Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
- **Cause**: Missing constraint in database
- **Fix**: Apply migration 002

### Error: "GEMINI_API_KEY is not set"
- **Cause**: Environment variables not loaded
- **Fix**: Copy `.env` to `.env.local` and ensure workers load dotenv

### Worker starts but no jobs are indexed
- **Check**: Verify there are active jobs in the database
- **Check**: Make sure Redis is running (`docker ps`)