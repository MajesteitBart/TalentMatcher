# Talent Matcher MVP Frontend Plan

## Executive Summary

Simplified MVP plan for the Talent Matcher frontend - focusing on essential CRUD operations and basic workflow viewing. Clean, functional interface that allows users to manage candidates, jobs, and view AI matching results without complex features.

## Current State Analysis

### Existing Infrastructure
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS (configured)
- **UI Components**: Basic HTML with Tailwind classes
- **Data Fetching**: Native fetch API via endpoints
- **Authentication**: Supabase Auth (configured but not implemented in UI)

### Current API Endpoints
- `POST /api/candidates/reject` - Reject candidate and trigger matching workflow
- `GET /api/workflow/status/[id]` - Check workflow execution status
- `POST /api/jobs/index` - Index jobs for vector search

### Core Data Models
- Companies, Jobs, Candidates, Applications
- Workflow Executions, Match Results
- Parsed CVs with AI-powered analysis

## MVP Target User

### HR Manager / Recruiter
- View and manage rejected candidates
- Review AI-generated job matches
- Create and edit job postings
- Monitor basic workflow status

## Simplified Application Architecture

### 1. Simple Navigation Layout
```
┌─────────────────────────────────────────────────────┐
│ Header: [Logo] [Candidates] [Jobs] [Workflows]      │
├─────────────────────────────────────────────────────┤
│ Page Content Area                                   │
│                                                     │
│ [Dynamic page content based on navigation]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Candidates Page
```
Candidates List:
┌─────────────────────────────────────────────────────┐
│ [+ Add Candidate]    [Search: ____________]        │
├─────────────────────────────────────────────────────┤
│ Name           │ Email         │ Status            │
│ John Doe       │ john@...      │ Rejected          │
│ Skills: JS, React             │ [View] [Match]    │
├─────────────────────────────────────────────────────┤
│ Jane Smith     │ jane@...      │ Pending           │
│ Skills: Python, Django         │ [View] [Edit]     │
└─────────────────────────────────────────────────────┘

Candidate Detail:
┌─────────────────────────────────────────────────────┐
│ Name: John Doe    Email: john@example.com          │
│ Status: Rejected  Reason: "Not enough experience"  │
├─────────────────────────────────────────────────────┤
│ CV Preview (first 500 chars)                        │
│ "Experienced software developer with 5 years..."    │
├─────────────────────────────────────────────────────┤
│ AI Match Results (if available)                     │
│ ┌─ Job: Senior Developer ──┐                       │
│ │ Match Score: 85%         │                       │
│ │ Key Skills Match: ✅     │                       │
│ │ Experience Level: ✅      │                       │
│ │ [View Job Details]       │                       │
│ └──────────────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

### 3. Jobs Page
```
Jobs List:
┌─────────────────────────────────────────────────────┐
│ [+ Add New Job]    [Index All Jobs]                 │
├─────────────────────────────────────────────────────┤
│ Title          │ Department    │ Status            │
│ Senior Dev     │ Engineering   │ Active            │
│ Skills: JS, React             │ [Edit] [Index]    │
├─────────────────────────────────────────────────────┤
│ Product Manager│ Product       │ Draft             │
│ Skills: Agile, SQL            │ [Edit] [Delete]   │
└─────────────────────────────────────────────────────┘

Job Form (Create/Edit):
┌─────────────────────────────────────────────────────┐
│ Job Title: [________________]                      │
│ Department: [_______________]                      │
│ Description: [textarea]                            │
│ Required Skills: [tag input]                        │
│ Experience Level: [dropdown]                       │
│ Location: [_____________]                           │
│ Job Type: [dropdown]                                │
│                                                     │
│ [Cancel] [Save Job]                                 │
└─────────────────────────────────────────────────────┘
```

### 4. Workflows Page
```
Workflows List:
┌─────────────────────────────────────────────────────┐
│ [Refresh]    Last updated: 2 mins ago              │
├─────────────────────────────────────────────────────┤
│ Candidate      │ Status          │ Matches         │
│ John Doe       │ Completed       │ 3 jobs found    │
│ Started: 10:30 AM              │ Duration: 2m 15s │
├─────────────────────────────────────────────────────┤
│ Jane Smith     │ Processing      │ -               │
│ Started: 10:45 AM              │ In progress...   │
├─────────────────────────────────────────────────────┤
│ Bob Johnson    │ Failed          │ Error           │
│ Started: 09:15 AM              │ View details     │
└─────────────────────────────────────────────────────┘
```

## Simplified Tech Stack

### Core Dependencies (Already Available)
- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase client
- React Hook Form + Zod validation
- **Supabase MCP** - For database schema queries and authentication documentation

### Additional MVP Dependencies
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-toast": "^1.1.5",
  "lucide-react": "^0.294.0",
  "date-fns": "^4.1.0"
}
```

### MCP Usage Strategy
- **Database Schema**: Use Supabase MCP to query tables, columns, and relationships
- **Authentication**: Reference Supabase MCP docs for auth implementation patterns
- **Type Generation**: Use MCP to generate TypeScript types from database schema
- **Query Examples**: Get sample queries for database operations from MCP documentation

## Development Workflow Using Supabase MCP

### 1. Database Schema Discovery
```bash
# Query all tables in the database
Use: mcp__supabase__list_tables with schemas: ["public"]

# Query specific table structure
# This will give us column names, types, and relationships
```

### 2. TypeScript Type Generation
```typescript
// Use MCP to generate types from database schema
// Example workflow:
// 1. Query table structure using Supabase MCP
// 2. Generate TypeScript interfaces
// 3. Use in components for type safety

// Generated types example:
interface Candidate {
  id: string;
  name: string;
  email: string;
  cv_text: string;
  created_at: string;
  updated_at: string;
}
```

### 3. Authentication Implementation
```typescript
// Reference Supabase MCP documentation for auth patterns
// Get examples of:
// - User sign up/in
// - Session management
// - Protected routes
// - Row Level Security (RLS) queries
```

### 4. Query Examples and Best Practices
```typescript
// Use MCP to get sample queries for:
// - Fetching candidates with applications
// - Joining tables for complex data
// - Implementing filtering and search
// - Pagination patterns
```

## Simple Implementation Plan (1-2 Weeks)

### Week 1: Core Foundation
1. **Basic Layout & Navigation**
   - Simple header with navigation links
   - Responsive layout using Tailwind
   - No complex state management needed

2. **Candidates Management**
   - Simple candidates list page
   - Basic CRUD operations using Supabase
   - Candidate detail view with workflow status

3. **Jobs Management**
   - Jobs list page
   - Simple form for creating/editing jobs
   - Job indexing functionality

### Week 2: Workflow Integration
1. **Workflow Monitoring**
   - Simple workflows list page
   - Basic status checking using existing API
   - Refresh functionality

2. **Polish & Bug Fixes**
   - Basic error handling
   - Loading states
   - Form validation
   - Responsive fixes

## Essential Pages to Build

### 1. Layout & Navigation
```typescript
// app/components/layout/
- Header.tsx          // Simple navigation header
- LayoutWrapper.tsx   // Basic page layout wrapper
```

### 2. Pages (App Router)
```typescript
// app/
- page.tsx            // Dashboard (simple stats overview)
- candidates/
  - page.tsx          // Candidates list
  - [id]/page.tsx     // Candidate detail
- jobs/
  - page.tsx          // Jobs list
  - [id]/page.tsx     // Job detail/edit
  - new/page.tsx      // Create new job
- workflows/
  - page.tsx          // Workflows list
  - [id]/page.tsx     // Workflow status detail
```

### 3. Simple Components
```typescript
// app/components/ui/
- Button.tsx          // Basic button with variants
- Card.tsx            // Simple card wrapper
- Form.tsx            // Form wrapper with validation
- Modal.tsx           // Dialog/modal wrapper
- StatusBadge.tsx     // Status indicators
- SkillTags.tsx       // Display skill tags
```

## Data Fetching (Simple Approach Using Supabase MCP)

### 1. Schema-First Development with MCP
Before writing queries, use Supabase MCP to understand the database structure:
```typescript
// Use MCP to query table structure first
// Example: Query candidates table structure
// This gives us columns, types, and relationships to write accurate queries
```

### 2. Server Components
Use Next.js 14 Server Components for initial data fetching:
```typescript
// app/candidates/page.tsx
async function getCandidates() {
  // Query structure from MCP first:
  // SELECT column_name, data_type, is_nullable
  // FROM information_schema.columns
  // WHERE table_name = 'candidates'

  const supabase = createAdminClient()

  // Use MCP-informed query structure
  const { data } = await supabase
    .from('candidates')
    .select(`
      id,
      name,
      email,
      created_at,
      applications (
        id,
        status,
        jobs (
          id,
          title
        )
      )
    `)

  return data
}

export default async function CandidatesPage() {
  const candidates = await getCandidates()
  return <CandidatesList candidates={candidates} />
}
```

### 2. Client Components for Interactivity
Use React hooks for user interactions:
```typescript
// app/components/CandidateActions.tsx
'use client'

export function CandidateActions({ candidateId }: { candidateId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleReject = async () => {
    setIsLoading(true)
    await fetch('/api/candidates/reject', { /* ... */ })
    setIsLoading(false)
  }

  return <Button onClick={handleReject} disabled={isLoading}>
    {isLoading ? 'Processing...' : 'Reject & Match'}
  </Button>
}
```

## Styling Approach (Keep it Simple)

### 1. Design Tokens
Use Tailwind's built-in color palette:
- Primary: Blue (`blue-600`, `blue-500`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)
- Gray scale for text and borders

### 2. Component Patterns
Consistent styling patterns:
```css
/* Cards */
@apply bg-white border border-gray-200 rounded-lg shadow-sm p-6

/* Buttons */
@apply px-4 py-2 rounded-md font-medium transition-colors

/* Form inputs */
@apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
```

## MVP Success Criteria

### Must-Have Features
1. ✅ View list of candidates
2. ✅ Create/edit/delete jobs
3. ✅ Trigger candidate rejection and matching
4. ✅ View workflow status and results
5. ✅ Basic responsive design
6. ✅ Simple form validation

### Nice-to-Have (If Time)
1. 🔄 Basic search functionality
2. 🔄 Simple filtering (by status, date)
3. 🔄 Better error handling
4. 🔄 Loading states
5. 🔄 Mobile optimization

### Out of Scope for MVP
- ❌ Advanced analytics
- ❌ Complex dashboards
- ❌ Real-time updates
- ❌ User roles/permissions
- ❌ File uploads (CV handling)
- ❌ Email notifications
- ❌ Export functionality

## Implementation Order

### Day 1-2: Setup & Layout
1. Install minimal UI dependencies
2. Create basic layout components
3. Set up simple navigation
4. Add basic styling

### Day 3-4: Core CRUD
1. Build candidates list page
2. Add candidate detail view
3. Implement job management pages
4. Add basic forms

### Day 5-7: Workflow Integration
1. Build workflows monitoring page
2. Integrate candidate rejection API
3. Add workflow status checking
4. Test end-to-end flow

### Day 8-10: Polish
1. Add error handling
2. Improve responsive design
3. Add loading states
4. Basic testing and bug fixes

## Next Steps After MVP

1. **Gather User Feedback** - What works, what doesn't
2. **Identify Most Used Features** - Focus development there
3. **Performance Improvements** - Optimize based on usage
4. **Security Audit** - Add proper authentication/authorization
5. **Scale Considerations** - Plan for more users/data

## Conclusion

This MVP plan focuses on delivering core functionality quickly while maintaining clean code and good UX. The simplified approach ensures we can build a working frontend in 1-2 weeks that allows users to:

- Manage candidates and jobs
- Trigger AI-powered matching
- View workflow results
- Perform basic CRUD operations

The architecture is simple enough to be maintainable but flexible enough to be extended later as the product evolves.