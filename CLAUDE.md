# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talent Matcher Agent is an AI-powered candidate matching system that automatically matches rejected candidates to alternative open positions using Google Gemini AI and vector search. The system uses a microservices architecture with Next.js APIs, BullMQ background workers, and Supabase with pgvector for semantic search.

## Essential Development Commands

### Setup & Installation
```bash
npm install                                    # Install dependencies
cp .env.example .env.local                    # Configure environment variables
docker-compose up -d                          # Start Redis for job queue
```

### Development
```bash
# Quick Start - All Services at Once (Recommended)
npm run dev:concurrent                        # Start Next.js + both workers concurrently
npm run dev:all                               # Alternative: Start all services using bash script

# Individual Services (for separate terminals)
npm run dev                                   # Start Next.js development server only
npm run worker:workflow                       # Start workflow worker only
npm run worker:indexing                       # Start indexing worker only

# Other Commands
npm run lint                                  # Run ESLint
npm run build                                 # Build for production
npm run start                                 # Start production server
```

**Note**: `npm run dev:concurrent` starts all three services (Next.js server, workflow worker, and indexing worker) in a single terminal with color-coded output. Press Ctrl+C to stop all services at once.

### Testing Workflow
```bash
# Index jobs for vector search
curl -X POST http://localhost:3000/api/jobs/index \
  -H "Content-Type: application/json" \
  -d '{"company_id": "00000000-0000-0000-0000-000000000001"}'

# Trigger candidate matching
curl -X POST http://localhost:3000/api/candidates/reject \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "uuid",
    "application_id": "uuid",
    "rejection_reason": "Not enough experience"
  }'

# Check workflow status
curl http://localhost:3000/api/workflow/status/[workflow_execution_id]
```

## Architecture & Key Components

### Core Architecture Pattern
The system uses **event-driven architecture** with clear separation of concerns:
- **Web Layer**: Next.js API routes (`/app/api/`)
- **Business Logic**: LangGraph workflows (`/lib/langgraph/`)
- **Data Layer**: Supabase with RLS (`/lib/supabase/`)
- **AI Processing**: Google Gemini integrations (`/lib/gemini/`)
- **Background Processing**: BullMQ workers (`/lib/queue/`, `/workers/`)

### Workflow System (LangGraph)
The matching workflow uses parallel execution for performance:
```
START → Parse CV → Parallel Retrieval → Consolidate → Generate Analysis → END
                 ├── Skills Search (40% weight)
                 ├── Experience Search (35% weight)
                 └── Profile Search (25% weight)
```

Key workflow files:
- `/lib/langgraph/graph.ts` - Main workflow definition
- `/lib/langgraph/state.ts` - State management
- `/lib/langgraph/nodes/` - Individual workflow steps

### Vector Search System
Uses pgvector for semantic job matching with multi-dimensional embeddings:
- Full job description embeddings
- Skills-specific embeddings
- Experience-level embeddings
- Weighted scoring with multi-source boost

Key files:
- `/lib/vector/pgvector.ts` - Vector operations
- `/lib/gemini/embeddings.ts` - Embedding generation

### Background Processing
BullMQ with Redis for async job processing:
- `/lib/queue/workflow-queue.ts` - Queue setup
- `/workers/workflow-worker.ts` - Worker implementation
- `/workers/indexing-worker.ts` - Job indexing worker

### Database Schema
Key tables:
- `companies` - Company information
- `jobs` - Job postings
- `job_embeddings` - Vector embeddings for search
- `candidates` - Candidate profiles
- `parsed_cvs` - Structured CV data from Gemini
- `applications` - Job applications
- `workflow_executions` - LangGraph workflow tracking
- `match_results` - Matched jobs with scores

## Environment Configuration

Required environment variables in `.env.local`:
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

## Development Patterns

### Core Principles
1. **Fail Fast** - Check critical prerequisites, then proceed
2. **Trust the System** - Don't over-validate things that rarely fail
3. **Clear Errors** - When something fails, say exactly what and how to fix it
4. **Minimal Output** - Show what matters, skip decoration

### Error Handling
- Workflow continues even if individual nodes fail (graceful degradation)
- Retry logic with exponential backoff
- Comprehensive logging throughout the pipeline
- Clear error messages with exact solutions: `❌ {What failed}: {Exact solution}`

### Type Safety
- TypeScript interfaces for all data structures
- Zod validation for API inputs
- Auto-generated types from Supabase schema

### Performance Considerations
- Parallel vector search execution
- HNSW indexing for fast vector queries (~100ms)
- Total workflow time: ~10-15 seconds per candidate
- Cost: ~$0.12 per candidate workflow

### Path Standards
Always use relative paths for project file references to maintain portability and privacy:

✅ **Correct Examples:**
- `lib/langgraph/graph.ts`
- `app/api/jobs/index/route.ts`
- `components/candidate-card.tsx`

❌ **Incorrect Examples:**
- `/Users/username/project/lib/langgraph/graph.ts`
- `C:\Users\username\project\app\api\jobs\index\route.ts`

### File Operations Standards
- **Check and Create**: `mkdir -p .claude/{directory}` - don't ask permission
- **Read with Fallback**: Try to read, continue if missing with sensible defaults
- **Atomic Operations**: Make small, focused changes per commit
- **No Absolute Paths**: Never expose local directory structure in documentation

## Workflow Coordination

### Multi-Agent Development
When multiple agents work on the same epic:

1. **File-level Parallelism** - Agents working on different files never conflict
2. **Explicit Coordination** - When same file needed, coordinate explicitly
3. **Fail Fast** - Surface conflicts immediately, don't try to be clever
4. **Human Resolution** - Conflicts are resolved by humans, not agents

### Commit Patterns
- **Small, focused commits** with clear purpose
- **Commit message format**: `Issue #{number}: {description}`
- **Example**: `Issue #1234: Add user authentication schema`
- **Atomic commits** - single purpose per commit

### Synchronization Points
- After each commit
- Before starting new file
- When switching work streams
- Every 30 minutes of work

### Coordination Protocol
```bash
# Check before modifying shared files
git status {file}
git pull origin epic/{name}
# Make changes
git add {files}
git commit -m "Issue #{number}: {change}"
```

## Common Development Tasks

### Adding New Workflow Steps
1. Create node in `/lib/langgraph/nodes/`
2. Update workflow graph in `/lib/langgraph/graph.ts`
3. Update state type in `/lib/langgraph/state.ts`
4. Add corresponding tests

### Modifying Vector Search
1. Update embedding generation in `/lib/gemini/embeddings.ts`
2. Modify search logic in `/lib/vector/pgvector.ts`
3. Re-index jobs using `/api/jobs/index` endpoint

### Database Changes
1. Create SQL migration
2. Update TypeScript types
3. Modify queries in `/lib/supabase/queries/`
4. Test with local Supabase

## Git Operations

### Branch Management
Always create branches from a clean main branch:

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create branch for epic
git checkout -b epic/{name}
git push -u origin epic/{name}
```

### Branch Best Practices
1. **One branch per epic** - Not per issue
2. **Clean before create** - Always start from updated main
3. **Commit frequently** - Small commits are easier to merge
4. **Pull before push** - Get latest changes to avoid conflicts
5. **Use descriptive branches** - `epic/feature-name` not `feature`

### Merge Process
When epic is complete, merge back to main:
```bash
# From main repository
git checkout main
git pull origin main

# Merge epic branch
git merge epic/{name}

# If successful, clean up
git branch -d epic/{name}
git push origin --delete epic/{name}
```

### Handling Conflicts
If merge conflicts occur:
1. **Don't try to be clever** - Let humans resolve
2. **Report immediately** - Surface conflicts right away
3. **Stop work** - Pause until resolved
4. **Use `git status`** - See exactly what conflicts exist

## GitHub Operations

### Repository Protection
**CRITICAL**: Before ANY GitHub operation, check you're not targeting the CCPM template:

```bash
# Check if remote origin is the CCPM template repository
remote_url=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$remote_url" == *"automazeio/ccpm"* ]]; then
  echo "❌ ERROR: You're trying to sync with the CCPM template repository!"
  echo "This is a template for others to use. You should NOT create issues or PRs here."
  exit 1
fi
```

### GitHub CLI Usage
**Trust the system** - Don't pre-check authentication:

```bash
# Just run the command and handle failure
gh {command} || echo "❌ GitHub CLI failed. Run: gh auth login"
```

### Standard Operations
```bash
# Get issue details
gh issue view {number} --json state,title,body

# Create issue (always specify repo)
gh issue create --repo "$REPO" --title "{title}" --body-file {file}

# Add comment
gh issue comment {number} --body-file {file}
```

## Testing

### Test Execution Standards
1. **Always use test-runner agent** for comprehensive analysis
2. **No mocking** - use real services for accurate results
3. **Verbose output** - capture everything for debugging
4. **Check test structure first** - before assuming code bugs

### Running Tests
```bash
# Use the test-runner agent for all testing
Task agent_type="test-runner" description="Run tests" prompt="Execute tests for: {target}"

# Cleanup test processes
pkill -f "jest|mocha|pytest|phpunit" 2>/dev/null || true
```

### Test Output Focus
- **Success**: `✅ All tests passed ({count} tests in {time}s)`
- **Failure**: Focus on what failed with actionable fixes
- **No parallelization** - avoid conflicts between test runs

## Debugging

### Workers Not Starting
- Check Redis: `docker ps`
- Verify environment variables
- Check worker terminal for errors

### Database Issues
- Verify Supabase credentials
- Check migration ran successfully
- Ensure pgvector extension enabled

### AI API Errors
- Verify Gemini API key and quota
- Check request/response formats
- Monitor token usage costs

## Standard Output Formats

### Success Output
```markdown
✅ {Action} complete
  - {Key result 1}
  - {Key result 2}
Next: {Single suggested action}
```

### Error Output
Keep them short and actionable:
```markdown
❌ {What failed}: {Exact solution}
Example: "❌ Epic not found: Run /pm:prd-parse feature-name"
```

### List Output
```markdown
{Count} {items} found:
- {item 1}: {key detail}
- {item 2}: {key detail}
```

### Progress Output
```markdown
{Action}... {current}/{total}
```

## Quick Reference

### Essential Development Tools
- Read/List operations: `Read, LS, Glob`
- File creation: `Read, Write, Edit`
- GitHub operations: Add `Bash`
- Complex analysis: Add `Task` (sparingly)
- Testing: Use `Task` with `test-runner` agent

### Status Indicators
- ✅ Success (use sparingly)
- ❌ Error (always with solution)
- ⚠️ Warning (only if action needed)
- No emoji for normal output

### Best Practices Summary
1. **Simple is not simplistic** - Handle errors properly, don't over-prevent
2. **Trust the system** - File system usually works, GitHub CLI usually authenticated
3. **Focus on happy path** - Fail gracefully when things go wrong
4. **Use relative paths** - Maintain portability and privacy
5. **Commit frequently** - Small, focused commits with clear messages
6. **Test smart** - Use test-runner agent, no mocking, real services

## Production Deployment

Key considerations from README.md:
- Set up authentication and RLS policies
- Configure monitoring and alerting
- Deploy workers separately from web app
- Set up CI/CD pipeline
- Configure backup strategy
- Performance testing under load