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
npm run dev                                   # Start Next.js development server
npm run worker:workflow                       # Start background workers (separate terminal)
npm run worker:indexing                       # Start indexing workers (optional)
npm run lint                                  # Run ESLint
npm run build                                 # Build for production
npm run start                                 # Start production server
```

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

### Error Handling
- Workflow continues even if individual nodes fail (graceful degradation)
- Retry logic with exponential backoff
- Comprehensive logging throughout the pipeline

### Type Safety
- TypeScript interfaces for all data structures
- Zod validation for API inputs
- Auto-generated types from Supabase schema

### Performance Considerations
- Parallel vector search execution
- HNSW indexing for fast vector queries (~100ms)
- Total workflow time: ~10-15 seconds per candidate
- Cost: ~$0.12 per candidate workflow

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

## Production Deployment

Key considerations from README.md:
- Set up authentication and RLS policies
- Configure monitoring and alerting
- Deploy workers separately from web app
- Set up CI/CD pipeline
- Configure backup strategy
- Performance testing under load