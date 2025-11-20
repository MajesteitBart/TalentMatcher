# Talent Matcher Developer Guide

## Overview

This guide helps developers get started with the Talent Matcher codebase and understand the comprehensive Claude Code development infrastructure that has been implemented.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (for Redis)
- Supabase account
- Google Gemini API key
- Claude Code CLI (claude.ai/code)

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd TalentMatcher
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
# Fill in your credentials in .env.local
```

3. **Start Services**
```bash
# Quick start - all services at once
npm run dev:concurrent

# Or individual services
npm run dev                    # Next.js server
npm run worker:workflow        # Workflow worker
npm run worker:indexing        # Job indexing worker
```

4. **Verify Setup**
Visit [http://localhost:3000](http://localhost:3000) and ensure all services are running.

## Claude Code Development Infrastructure

The Talent Matcher project includes a comprehensive Claude Code development ecosystem with specialized agents and commands.

### Agent Architecture

We use 9 specialized agents that work together:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **@agent-workflow-orchestrator** | Central coordination | Complex, multi-step tasks |
| **@agent-react-nextjs-expert** | Frontend/Fullstack | React/Next.js features, bugs |
| **@agent-code-analyzer** | Logic/Bug analysis | Deep code investigation |
| **@agent-test-runner** | Testing | Test execution, log analysis |
| **@agent-pragmatic-code-review** | Code quality | PR reviews, security checks |
| **@agent-design-review** | UI/UX | Visual consistency, accessibility |
| **@agent-parallel-worker** | Bulk operations | Multiple independent tasks |
| **@agent-documentation-writer** | Documentation | API docs, guides, READMEs |
| **@agent-file-analyzer** | Log analysis | Large log file summarization |

### Project Management Commands

The project includes 50+ commands organized into categories:

#### Epic Management
```bash
/pm:init                    # Initialize new epic
/pm:epic-list              # List all epics
/pm:epic-show <name>       # Show epic details
/pm:epic-start <name>      # Start working on epic
/pm:status                 # Show current work status
/pm:next                   # Get next task
/pm:standup                # Generate standup report
```

#### Issue Management
```bash
/pm:issue-create           # Create new issue
/pm:issue-list             # List all issues
/pm:issue-start <number>   # Start working on issue
/pm:issue-close <number>   # Close completed issue
/pm:issue-sync             # Sync issues with GitHub
```

#### Product Requirements
```bash
/pm:prd-new <feature>      # Create new PRD
/pm:prd-list               # List all PRDs
/pm:prd-edit <feature>     # Edit existing PRD
/pm:prd-parse <feature>    # Parse PRD into tasks
```

#### Development Workflow
```bash
/review                    # Code review mode
/testing:run               # Run tests with analysis
/commit                    # Smart commit with validation
/prompt <task>             # Get AI assistance
```

## Development Patterns

### 1. Epic-Based Development

We organize work around **epics** (large features) rather than individual issues:

```bash
# Start new epic
/pm:init

# Parse requirements into tasks
/pm:prd-parse user-authentication

# Start work
/pm:epic-start user-authentication

# Get next task
/pm:next

# Complete work and commit
/commit

# Close epic when done
/pm:epic-close user-authentication
```

### 2. Agent Coordination

For complex tasks, use the workflow orchestrator:

```bash
# Let orchestrator coordinate the work
Task agent_type="workflow-orchestrator" description="Add user authentication"
```

The orchestrator will:
1. Analyze requirements
2. Create execution plan
3. Delegate to specialized agents
4. Coordinate between agents
5. Synthesize final results

### 3. Testing Workflow

Always use the test-runner agent for comprehensive testing:

```bash
Task agent_type="test-runner" description="Run authentication tests"
```

This includes:
- Unit tests
- Integration tests
- API endpoint testing
- Error scenario testing
- Performance analysis

### 4. Documentation Updates

The documentation-writer agent automatically updates docs:

```bash
Task agent_type="documentation-writer" description="Update API docs for auth feature"
```

### 5. Code Quality Gates

Before merging, use pragmatic code review:

```bash
Task agent_type="pragmatic-code-review" description="Review authentication changes"
```

## Branch Strategy

### Epic Branches

```bash
# Always start from clean main
git checkout main
git pull origin main

# Create epic branch
git checkout -b epic/user-authentication
git push -u origin epic/user-authentication
```

### Commit Patterns

```bash
# Use smart commit command
/commit

# This will:
# - Run tests
# - Check code quality
# - Generate proper commit message
# - Create commit with proper format
```

### Merge Process

```bash
# From main branch
git checkout main
git pull origin main
git merge epic/user-authentication

# Clean up if successful
git branch -d epic/user-authentication
git push origin --delete epic/user-authentication
```

## Code Standards

### 1. Path Standards
Always use **relative paths** for portability:

```javascript
✅ Correct:
import { logger } from '@/lib/utils/logger'
import { APIResponse } from '@/lib/types'

❌ Incorrect:
import { logger } from '/Users/username/project/lib/utils/logger'
```

### 2. Error Handling
Follow the project's error handling pattern:

```javascript
try {
  const result = await someOperation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  logger.error('Operation failed', { error })

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }
    }, { status: 400 })
  }

  return NextResponse.json({
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  }, { status: 500 })
}
```

### 3. TypeScript Standards
- Use strict TypeScript configuration
- Provide proper types for all functions
- Use Zod for runtime validation
- Generate types from database schema

### 4. Testing Standards
- No mocking - use real services
- Test all error scenarios
- Include integration tests
- Test API endpoints with real requests

## Environment Configuration

### Development Environment
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Claude Code Configuration
```json
{
  "agents": {
    "workflow-orchestrator": {
      "model": "opus",
      "tools": ["Task", "Agent", "Read", "LS", "Glob", "Grep", "Bash"]
    }
  },
  "commands": {
    "pm": {
      "epic-management": true,
      "issue-tracking": true,
      "prd-management": true
    }
  }
}
```

## UI Design System v4

### Design Philosophy

The v4 redesign follows these core principles:
- **Single-Column Layout**: Focused, linear information flow
- **Semantic Color Coding**: Consistent meaning through colors
- **Progressive Disclosure**: Essential information first
- **Mobile-First**: Responsive design from small screens up

### Layout Patterns

#### Page Structure
```typescript
// Standard page layout (v4)
<div className="max-w-4xl mx-auto space-y-6">
  {/* Clean header with actions */}
  <div className="flex items-center justify-between">
    <Button size="sm" variant="ghost" asChild>
      <Link href="/back">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Link>
    </Button>
    <Button size="sm" asChild>
      <Link href="/action">
        <ActionIcon className="w-4 h-4 mr-2" />
        Primary Action
      </Link>
    </Button>
  </div>

  {/* Single-source information */}
  <Card className="border-0 shadow-sm">
    <CardContent className="pt-6">
      {/* Essential content */}
    </CardContent>
  </Card>

  {/* Priority-based sections */}
  <div className="space-y-6">
    <Card> {/* Highest priority content */} </Card>
    {conditionalContent && <Card> {/* Conditional content */} </Card>}
    <Card> {/* Secondary content */} </Card>
  </div>
</div>
```

#### Card Patterns
```typescript
// Primary card - main content
<Card className="border-0 shadow-sm">
  <CardContent className="pt-6">
    {/* Content */}
  </CardContent>
</Card>

// Section card - grouped content
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      Section Title
    </CardTitle>
    <CardDescription>Section description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Alert card - warnings/danger
<Card className="border-red-100 bg-red-50/30">
  <CardContent className="pt-6">
    {/* Warning content */}
  </CardContent>
</Card>
```

### Color System

#### Semantic Colors
```typescript
const statusColors = {
  // Success states
  active: 'bg-green-100 text-green-800',
  hired: 'bg-emerald-100 text-emerald-800',
  valid: 'bg-green-100 text-green-800',

  // Warning states
  underReview: 'bg-yellow-100 text-yellow-800',
  mid: 'bg-blue-100 text-blue-800',
  needsReview: 'bg-yellow-100 text-yellow-800',

  // Information states
  applied: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  junior: 'bg-green-100 text-green-800',
  senior: 'bg-purple-100 text-purple-800',

  // Error states
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-red-100 text-red-800',
  invalid: 'bg-red-100 text-red-800',

  // Neutral states
  draft: 'bg-gray-100 text-gray-800',
  unknown: 'bg-gray-100 text-gray-800'
}
```

#### Badge Variants
```typescript
const getBadgeVariant = (score: number) => {
  if (score >= 0.8) return 'default'      // Green - Excellent
  if (score >= 0.6) return 'secondary'    // Yellow - Good
  return 'destructive'                     // Red - Poor
}
```

### Component Patterns

#### Empty States
```typescript
if (items.length === 0) {
  return (
    <div className="text-center py-8">
      <ItemIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground mb-4">No items yet</p>
      <div className="flex justify-center space-x-3">
        <Button asChild>
          <Link href="/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/browse">Browse Items</Link>
        </Button>
      </div>
    </div>
  )
}
```

#### Loading States
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  )
}
```

#### Status Indicators
```typescript
<div className="flex items-center gap-3 text-sm text-muted-foreground">
  <Icon className="w-4 h-4" />
  <span>Label</span>
  <span>•</span>
  <span>Additional info</span>
</div>
```

### Typography Hierarchy
```typescript
// Page titles
<h1 className="text-2xl font-bold text-foreground">Page Title</h1>

// Card titles
<CardTitle className="text-lg">Card Title</CardTitle>

// Section headers
<h3 className="font-medium text-foreground">Section Header</h3>

// Body text
<p className="text-sm text-muted-foreground">Body content</p>

// Metadata
<span className="text-xs text-muted-foreground">Metadata</span>
```

## Common Development Tasks

### Adding New API Endpoints

1. **Create endpoint file**
```bash
# Use react-nextjs-expert
Task agent_type="react-nextjs-expert" description="Create new user profile API endpoint"
```

2. **Add validation schema**
```typescript
const UserProfileSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  bio: z.string().max(1000).optional()
})
```

3. **Update documentation**
```bash
# Documentation will be auto-updated
Task agent_type="documentation-writer" description="Update API docs for user profile endpoint"
```

### Creating New UI Components (v4)

1. **Follow v4 design patterns**
```typescript
// Use single-column layout
<div className="max-w-4xl mx-auto space-y-6">
  {/* Content */}
</div>

// Apply semantic colors
<Badge className="bg-green-100 text-green-800">Status</Badge>

// Use consistent spacing
<div className="space-y-6">
  <div className="p-4 rounded-lg border">...</div>
  <div className="p-4 rounded-lg border">...</div>
</div>
```

2. **Add proper empty states**
```typescript
{items.length === 0 && (
  <div className="text-center py-8">
    <EmptyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
    <p className="text-muted-foreground mb-4">No items yet</p>
    <Button>Add First Item</Button>
  </div>
)}
```

3. **Implement responsive design**
```typescript
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1"> {/* Content */} </div>
</div>
```

4. **Test with design-review agent**
```bash
Task agent_type="design-review" description="Review new component for UI consistency"
```

### Database Schema Changes

1. **Create migration**
```sql
-- Add to migrations/
ALTER TABLE users ADD COLUMN bio TEXT;
```

2. **Update types**
```bash
# Types will be auto-generated from Supabase
```

3. **Test changes**
```bash
Task agent_type="test-runner" description="Test database schema changes"
```

### Adding New Workflow Steps

1. **Create workflow node**
```typescript
// lib/langgraph/nodes/new-step.ts
export async function newWorkflowStep(state: WorkflowState) {
  // Implementation
}
```

2. **Update graph**
```typescript
// lib/langgraph/graph.ts
const workflow = new StateGraph(WorkflowState)
  .addNode('new_step', newWorkflowStep)
```

3. **Test workflow**
```bash
Task agent_type="test-runner" description="Test new workflow step"
```

## Debugging Guide

### Common Issues

#### Workers Not Starting
```bash
# Check Redis
docker ps
docker-compose logs redis

# Check environment variables
cat .env.local

# Check worker logs
npm run worker:workflow
```

#### Database Issues
```bash
# Verify Supabase connection
npx supabase status

# Check migrations
npx supabase db list

# Reset local database
npx supabase db reset
```

#### Test Failures
```bash
# Run tests with detailed output
Task agent_type="test-runner" description="Debug test failures"

# Check test structure
find . -name "*.test.*" -type f
```

### Performance Monitoring

The system includes built-in performance tracking:

```javascript
// Workflow timing
const startTime = Date.now()
// ... workflow execution
const duration = Date.now() - startTime
logger.info('Workflow completed', { duration, candidateId })
```

### Error Tracking

All errors are automatically logged with context:

```javascript
logger.error('API error', {
  error: error.message,
  stack: error.stack,
  userId,
  endpoint,
  requestBody
})
```

## Getting Help

### Internal Help
```bash
# Get help with commands
/pm:help

# Show current status
/pm:status

# Get next task
/pm:next
```

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [BullMQ Documentation](https://docs.bullmq.io/)

## Contributing

1. **Always use epic-based development**
2. **Follow the agent coordination patterns**
3. **Write comprehensive tests**
4. **Update documentation**
5. **Use smart commit patterns**
6. **Participate in code reviews**

Remember: The Claude Code infrastructure is designed to make development faster and more reliable. Trust the agents, follow the patterns, and let the automation handle the repetitive tasks.