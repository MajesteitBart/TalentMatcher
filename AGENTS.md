# AI Agent Development Guide - Talent Matcher

This document captures lessons learned and best practices for AI-assisted development using Claude Code and various MCP (Model Context Protocol) tools.

## 🎯 Project Overview

**Talent Matcher Agent** is an AI-powered candidate matching system that automatically matches rejected candidates to alternative open positions using Google Gemini AI and vector search.

**Tech Stack**: Next.js 14, TypeScript, Supabase, BullMQ, Google Gemini AI, pgvector

## 🤖 AI Agent Development Workflow

### MCP-Driven Development Process

Our development leverages multiple MCP tools for accelerated development:

1. **Database Schema Discovery**
   ```typescript
   // Use Supabase MCP to understand database structure
   mcp__supabase__list_tables({ schemas: ["public"] })
   mcp__supabase__execute_sql("SELECT * FROM candidates LIMIT 5")
   ```

2. **Type Generation**
   ```typescript
   // Auto-generate TypeScript types from actual schema
   // Found in: lib/types/database.ts
   export type CandidateWithApplications = Database['public']['Tables']['candidates']['Row'] & {
     applications: ApplicationWithJob[]
   }
   ```

3. **Component Development**
   ```typescript
   // Use shadcn MCP for UI components
   mcp__shadcn__getComponents()
   mcp__shadcn__getComponent({ component: "card" })
   ```

## 🚨 Critical Lessons Learned

### 1. Supabase Query Complexity Issues

**Problem**: Complex nested queries with multiple joins fail silently and return empty arrays.

❌ **Problematic Pattern**:
```typescript
const { data, error } = await supabase
  .from('candidates')
  .select(`
    id, name, email,
    applications (
      id, status,
      job: jobs (id, title, department)
    )
  `)
// Returns: [] (empty array) even with data in database
```

✅ **Solution Pattern**:
```typescript
// Break into separate, simpler queries
const { data: candidates } = await supabase
  .from('candidates')
  .select('id, name, email')

const { data: applications } = await supabase
  .from('applications')
  .select('id, status, candidate_id, job_id')
  .in('candidate_id', candidates.map(c => c.id))

// Combine in JavaScript
const result = candidates.map(candidate => ({
  ...candidate,
  applications: applications.filter(app => app.candidate_id === candidate.id)
}))
```

### 2. Environment Variable Access Patterns

**Problem**: Client components cannot access server-side environment variables.

❌ **Wrong Approach**:
```typescript
// lib/data/candidates.ts (imported in client component)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,  // ✅ Works
  process.env.SUPABASE_SERVICE_ROLE_KEY   // ❌ Undefined in client
)
```

✅ **Solution Pattern**:
```typescript
// Server components only
export default async function CandidatesPage() {
  const candidates = await getCandidates() // Server-side fetch
  return <CandidatesClient candidates={candidates} />
}

// lib/data/candidates.ts
export async function getCandidates() {
  const supabase = createAdminClient() // Uses service role key
  // Fetch and return data
}
```

### 3. Debugging Data Fetching Issues

**Problem**: Pages show empty states despite database having data.

**Debugging Strategy**:
1. **Create Debug Endpoints**
   ```typescript
   // app/api/candidates/debug/route.ts
   export async function GET() {
     const candidates = await getCandidates()
     return NextResponse.json({ count: candidates.length, candidates })
   }
   ```

2. **Test Database Directly**
   ```bash
   # Use MCP to verify data exists
   mcp__supabase__execute_sql("SELECT COUNT(*) FROM candidates")
   ```

3. **Check Server Logs**
   ```bash
   # Monitor for error messages
   npm run dev  # Watch console output
   ```

### 4. Component Architecture Patterns

**Server Components**: Data fetching, initial page load, form submissions
**Client Components**: User interactions, real-time updates, form state

✅ **Good Pattern**:
```typescript
// Server Component
export default async function WorkflowsPage() {
  const workflows = await getWorkflowExecutions()
  return <WorkflowsClient initialWorkflows={workflows} />
}

// Client Component
'use client'
export default function WorkflowsClient({ initialWorkflows }) {
  const [workflows, setWorkflows] = useState(initialWorkflows)
  // Interactive logic here
}
```

## 🛠️ MCP Tools Integration

### Supabase MCP Usage

```typescript
// Database exploration
const tables = await mcp__supabase__list_tables({ schemas: ["public"] })

// Direct SQL testing
const result = await mcp__supabase__execute_sql(`
  SELECT c.id, c.name, COUNT(a.id) as application_count
  FROM candidates c
  LEFT JOIN applications a ON c.id = a.candidate_id
  GROUP BY c.id, c.name
`)

// Check advisors for security/performance
const advisors = await mcp__supabase__get_advisors({ type: "security" })
```

### Shadcn MCP Integration

```typescript
// Available components
const components = await mcp__shadcn__getComponents()

// Get specific component info
const cardInfo = await mcp__shadcn__getComponent({
  component: "card"
})
```

## 📋 Best Practices

### 1. Error Handling

```typescript
export async function getCandidates(): Promise<Candidate[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('candidates')
      .select('*')

    if (error) {
      console.error('Error fetching candidates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}
```

### 2. Type Safety

```typescript
// Always use generated types
import type { Database } from '@/lib/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

// Validate with Zod when needed
import { z } from 'zod'
const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email()
})
```

### 3. Environment Variables

```typescript
// lib/supabase/admin.ts
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Database configuration error')
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

### 4. Component Organization

```
components/
├── ui/              # shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   └── badge.tsx
├── layout/          # Layout components
│   └── layout-wrapper.tsx
└── forms/           # Form components
    └── job-form.tsx
```

## 🔧 Development Workflow

### 1. Schema-First Development
1. Use Supabase MCP to understand database
2. Generate TypeScript types
3. Create data fetching utilities
4. Build UI components
5. Test with real data

### 2. Iterative Debugging
1. Create debug endpoints for complex data fetching
2. Test queries directly with MCP
3. Monitor server logs for errors
4. Fix issues incrementally

### 3. Component Architecture
1. Server components for data fetching
2. Client components for interactivity
3. Pass data via props
4. Handle loading/error states

## 📊 Performance Considerations

### Database Queries
- Use simple queries over complex joins
- Implement pagination for large datasets
- Add appropriate indexes
- Cache frequently accessed data

### Component Rendering
- Use React.memo for expensive components
- Implement loading skeletons
- Debounce search inputs
- Optimize bundle size

## 🚀 Production Deployment

### Environment Setup
- Use environment-specific configuration
- Secure service role keys
- Implement proper CORS policies
- Set up monitoring and logging

### Security Best Practices
- Row Level Security (RLS) policies
- Server-side environment variable access
- Input validation with Zod schemas
- Rate limiting on API endpoints

---

## 🎯 Key Takeaways

1. **MCP tools dramatically accelerate development** by providing direct database access and component libraries
2. **Complex Supabase queries can fail silently** - prefer simple queries and combine data in JavaScript
3. **Server/Client component separation is crucial** for environment variable access and performance
4. **Debug endpoints are essential** for troubleshooting data fetching issues
5. **Type safety and error handling** prevent production issues
6. **Iterative development with real data** catches issues early

This pattern has proven effective for rapid development while maintaining code quality and reliability.