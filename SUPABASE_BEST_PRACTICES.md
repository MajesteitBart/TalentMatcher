# Supabase SDK Best Practices

This document outlines best practices for using the Supabase SDK in Next.js applications, based on real-world experience from the Talent Matcher project.

## 🔧 Client Configuration

### Service Role vs Anonymous Client

```typescript
// lib/supabase/admin.ts - Server-side only
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'set' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: serviceKey ? 'set' : 'missing'
    })
    throw new Error('Database configuration error')
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// lib/supabase/client.ts - Client-side (when needed)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

### Environment Variables

```env
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚨 Critical Issues & Solutions

### 1. Complex Query Problem

**Issue**: Complex nested queries with multiple joins fail silently and return empty arrays.

❌ **Problematic Pattern**:
```typescript
const { data, error } = await supabase
  .from('candidates')
  .select(`
    id, name, email,
    applications (
      id, status,
      job: jobs (
        id, title, department,
        company: companies (name)
      )
    )
  `)
// Returns: [] even with data in database
```

✅ **Solution Pattern**:
```typescript
// Break into separate, simpler queries
export async function getCandidates(): Promise<CandidateWithApplications[]> {
  const supabase = createAdminClient()

  // 1. Get basic candidate data
  const { data: candidatesData, error: candidatesError } = await supabase
    .from('candidates')
    .select('id, name, email, cv_text, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (candidatesError) {
    console.error('Error fetching candidates:', candidatesError)
    return []
  }

  if (!candidatesData?.length) {
    return []
  }

  // 2. Get related data separately
  const candidateIds = candidatesData.map(c => c.id)

  const { data: applicationsData } = await supabase
    .from('applications')
    .select('id, status, candidate_id, job_id, applied_at')
    .in('candidate_id', candidateIds)

  const jobIds = applicationsData?.map(a => a.job_id) || []
  const { data: jobsData } = await supabase
    .from('jobs')
    .select('id, title, department')
    .in('id', jobIds)

  // 3. Combine data in JavaScript
  return candidatesData.map(candidate => ({
    ...candidate,
    applications: applicationsData
      ?.filter(app => app.candidate_id === candidate.id)
      .map(app => ({
        ...app,
        job: jobsData?.find(job => job.id === app.job_id) || null
      })) || []
  }))
}
```

### 2. Server/Client Component Separation

**Issue**: Client components cannot access server-side environment variables.

✅ **Correct Architecture**:
```typescript
// Server Component - app/candidates/page.tsx
import { getCandidates } from '@/lib/data/candidates'
import CandidatesClient from './candidates-client'

export default async function CandidatesPage() {
  const candidates = await getCandidates() // Server-side fetch
  return <CandidatesClient initialCandidates={candidates} />
}

// Client Component - components/candidates/candidates-client.tsx
'use client'
import { useState } from 'react'

export default function CandidatesClient({ initialCandidates }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  // Interactive logic here
}
```

## 📋 Data Fetching Patterns

### 1. Error Handling

```typescript
export async function getData<T>(query: any): Promise<T[]> {
  try {
    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Usage
export async function getCandidates(): Promise<Candidate[]> {
  const supabase = createAdminClient()
  return getData(
    supabase.from('candidates').select('*').order('created_at', { ascending: false })
  )
}
```

### 2. Pagination

```typescript
export async function getCandidatesPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Candidate[], count: number }> {
  const supabase = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('candidates')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching candidates:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}
```

### 3. Real-time Subscriptions (Client-side)

```typescript
// components/candidates/candidates-real-time.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Candidate } from '@/lib/types/database'

export default function CandidatesRealTime() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    fetchCandidates()

    // Set up real-time subscription
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        (payload) => {
          console.log('Change received!', payload)
          fetchCandidates() // Refetch data
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    setCandidates(data || [])
  }

  return (
    <div>
      {candidates.map(candidate => (
        <div key={candidate.id}>{candidate.name}</div>
      ))}
    </div>
  )
}
```

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
CREATE POLICY "Users can view their own candidates"
ON candidates FOR SELECT
USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Users can insert their own candidates"
ON candidates FOR INSERT
WITH CHECK (company_id = auth.jwt() ->> 'company_id');
```

### 2. Environment Variable Security

```typescript
// Never expose service role key to client
// ❌ WRONG
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ❌ Exposed to client
)

// ✅ RIGHT - Server only
export async function serverAction() {
  const supabase = createAdminClient() // Uses service role securely
  // Server-side logic
}
```

## 🎯 Performance Optimization

### 1. Query Optimization

```typescript
// ✅ Use specific column selection
const { data } = await supabase
  .from('candidates')
  .select('id, name, email') // Only needed columns
  .eq('status', 'active')

// ❌ Avoid selecting all columns when not needed
const { data } = await supabase
  .from('candidates')
  .select('*') // Selects all columns
```

### 2. Database Indexes

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_candidates_company_id ON candidates(company_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_workflows_status ON workflow_executions(status);

-- Composite indexes for complex queries
CREATE INDEX idx_applications_candidate_status
ON applications(candidate_id, status);
```

### 3. Caching Strategy

```typescript
// lib/data/candidates.ts
import { cache } from 'react'

export const getCandidates = cache(async () => {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('candidates')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  return data || []
})

// Usage in server components
import { getCandidates } from '@/lib/data/candidates'

export default async function CandidatesPage() {
  const candidates = await getCandidates() // Cached result
  return <CandidatesClient candidates={candidates} />
}
```

## 🛠️ Development Tools & Debugging

### 1. Debug Endpoints

```typescript
// app/api/debug/candidates/route.ts
import { NextResponse } from 'next/server'
import { getCandidates } from '@/lib/data/candidates'

export async function GET() {
  try {
    const candidates = await getCandidates()

    return NextResponse.json({
      success: true,
      count: candidates.length,
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        created_at: c.created_at
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
```

### 2. Type Safety

```typescript
// Always use generated types
import type { Database } from '@/lib/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']
type Application = Database['public']['Tables']['applications']['Row']

// Validate with Zod
import { z } from 'zod'

const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  company_id: z.string().uuid()
})

export type ValidatedCandidate = z.infer<typeof CandidateSchema>
```

## 📊 Monitoring & Logging

### 1. Query Performance Monitoring

```typescript
export async function getWorkflowExecutions(): Promise<WorkflowExecution[]> {
  const supabase = createAdminClient()
  const startTime = Date.now()

  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .order('created_at', { ascending: false })

  const duration = Date.now() - startTime

  // Log performance metrics
  console.log(`getWorkflowExecutions completed in ${duration}ms, found ${data?.length || 0} workflows`)

  if (error) {
    console.error('Error fetching workflow executions:', error)
    return []
  }

  return data || []
}
```

### 2. Error Tracking

```typescript
export async function robustQuery<T>(
  queryFn: () => Promise<{ data?: T, error?: any }>,
  operation: string
): Promise<T[]> {
  try {
    const { data, error } = await queryFn()

    if (error) {
      console.error(`${operation} failed:`, {
        error: error.message,
        code: error.code,
        details: error.details
      })
      return []
    }

    return data || []
  } catch (error) {
    console.error(`${operation} crashed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}

// Usage
export async function getCandidates(): Promise<Candidate[]> {
  return robustQuery(
    () => createAdminClient().from('candidates').select('*'),
    'getCandidates'
  )
}
```

## 🎯 Key Takeaways

1. **Prefer Simple Queries**: Break complex joins into separate queries and combine in JavaScript
2. **Server/Client Separation**: Use server components for data fetching, client components for interactivity
3. **Error Handling**: Always handle both Supabase errors and unexpected exceptions
4. **Type Safety**: Use generated types and validate with Zod when needed
5. **Performance**: Select specific columns, use indexes, and implement caching
6. **Security**: Never expose service role keys, implement RLS policies
7. **Debugging**: Create debug endpoints and log performance metrics
8. **Real-time**: Use subscriptions for live updates when appropriate

These practices will help you build robust, performant, and maintainable applications with Supabase.