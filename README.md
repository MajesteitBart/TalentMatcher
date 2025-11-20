# 🏗️ Talent Matcher Agent

AI-powered system for automatically matching rejected candidates to alternative open positions.

## 🎯 Overview

When a candidate is rejected for a position, this system automatically:
1. Parses their CV using Gemini AI
2. Generates embeddings for skills, experience, and overall profile
3. Searches for similar open positions using pgvector
4. Consolidates and ranks matches
5. Generates a detailed analysis memo for recruiters

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, BullMQ workers
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: Google Gemini 2.0 (CV parsing, embeddings, analysis)
- **Workflow**: LangGraph (parallel execution orchestration)
- **Queue**: BullMQ + Redis (background job processing)

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker (for Redis)
- Supabase account
- Google Gemini API key

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration from `supabase-migration.sql` in the SQL Editor
3. Note your Project URL, anon key, and service_role key

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Start Redis

```bash
docker-compose up -d
```

### 5. Start Development Services

**Quick Start (Recommended):**
```bash
npm run dev:concurrent  # Starts all services at once with color-coded output
```

**Individual Services:**
```bash
# Terminal 1: Next.js server
npm run dev

# Terminal 2: Workflow worker
npm run worker:workflow

# Terminal 3: Job indexing worker
npm run worker:indexing
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Setup Claude Code Infrastructure (Optional but Recommended)

The project includes comprehensive Claude Code development tools:

```bash
# Initialize project management
/pm:init

# List available commands
/pm:help

# Show current development status
/pm:status
```

For detailed setup, see the [Developer Guide](./docs/DEVELOPER_GUIDE.md).

## 📡 API Endpoints

### Reject Candidate & Trigger Matching

```bash
POST /api/candidates/reject
Content-Type: application/json

{
  "candidate_id": "uuid",
  "application_id": "uuid",
  "rejection_reason": "Not enough experience" 
}
```

### Check Workflow Status

```bash
GET /api/workflow/status/[workflow_execution_id]
```

### Index Jobs for Vector Search

```bash
POST /api/jobs/index
Content-Type: application/json

{
  "company_id": "uuid",
  "job_ids": ["uuid1", "uuid2"] // optional, indexes all active jobs if omitted
}
```

## 🔄 Workflow Architecture

The matching workflow uses LangGraph for orchestration:

```
START
  ↓
Parse CV (Gemini)
  ↓
  ├── Retrieve by Skills (parallel)
  ├── Retrieve by Experience (parallel)
  └── Retrieve by Profile (parallel)
  ↓
Consolidate Matches (weighted scoring)
  ↓
Generate Analysis (Gemini)
  ↓
END
```

### Key Features:

- **Parallel Execution**: Skills, experience, and profile searches run simultaneously
- **Weighted Scoring**: Skills (40%), Experience (35%), Profile (25%)
- **Multi-source Boost**: Jobs matching multiple criteria get a 5% boost per source
- **Graceful Degradation**: Workflow continues even if some retrievers fail

## 📊 Database Schema

Key tables:
- `companies` - Company information
- `jobs` - Job postings
- `job_embeddings` - Vector embeddings for semantic search
- `candidates` - Candidate profiles
- `parsed_cvs` - Structured CV data
- `applications` - Job applications
- `workflow_executions` - LangGraph workflow runs
- `match_results` - Matched jobs with scores

## 🤖 Claude Code Development Infrastructure

This project includes a comprehensive Claude Code development ecosystem with specialized agents and tools.

### Key Features

- **9 Specialized Agents**: Code analysis, testing, documentation, design review, and more
- **50+ Project Management Commands**: Epic/issue tracking, PRD management, workflow automation
- **Automated Testing**: Comprehensive test execution with real services (no mocking)
- **Smart Documentation**: Auto-generated and updated documentation
- **Epic-Based Development**: Organize work around large features rather than individual issues

### Quick Commands

```bash
# Project Management
/pm:init                    # Initialize new epic
/pm:status                 # Show current work status
/pm:next                   # Get next task
/pm:standup                # Generate standup report

# Development Workflow
/review                    # Code review mode
/testing:run               # Run tests with analysis
/commit                    # Smart commit with validation
/prompt <task>             # Get AI assistance

# Get Help
/pm:help                   # List all available commands
```

### Agent Coordination

For complex tasks, agents work together automatically:

```bash
# Example: Add new feature
Task agent_type="workflow-orchestrator" description="Add user authentication"
```

This will coordinate multiple agents to:
1. Analyze requirements
2. Create implementation plan
3. Build the feature
4. Write tests
5. Update documentation
6. Perform code review

For complete documentation, see the [Developer Guide](./docs/DEVELOPER_GUIDE.md).

## 🧪 Testing

### Automated Testing with Claude Code

Use the specialized test-runner agent for comprehensive testing:

```bash
# Run all tests with analysis
Task agent_type="test-runner" description="Run full test suite"

# Test specific functionality
Task agent_type="test-runner" description="Test authentication endpoints"
```

### Manual Testing

To test the workflow manually:

1. First, index some jobs:
```bash
curl -X POST http://localhost:3000/api/jobs/index
  -H "Content-Type: application/json"
  -d '{"company_id": "00000000-0000-0000-0000-000000000001"}'
```

2. Create a candidate and application (via Supabase dashboard or API)

3. Reject the candidate to trigger matching:
```bash
curl -X POST http://localhost:3000/api/candidates/reject
  -H "Content-Type: application/json"
  -d '{
    "candidate_id": "your-candidate-uuid",
    "application_id": "your-application-uuid",
    "rejection_reason": "Overqualified"
  }'
```

4. Check the workflow status:
```bash
curl http://localhost:3000/api/workflow/status/[workflow_id]
```

## 📈 Performance

- **CV Parsing**: ~2-4 seconds
- **Embedding Generation**: ~1 second per type (3 parallel)
- **Vector Search**: <100ms per query (with HNSW index)
- **Match Consolidation**: <50ms
- **Analysis Generation**: ~3-5 seconds
- **Total Workflow**: ~10-15 seconds

## 💰 Cost Estimates

Per candidate workflow:
- Gemini Parsing: ~$0.02
- Embeddings (3 types): ~$0.06
- Vector Search: ~$0.01
- Analysis: ~$0.03
- **Total**: ~$0.12 per candidate

## 🛡️ Production Checklist

- [ ] Set up proper authentication
- [ ] Configure Row Level Security (RLS) in Supabase
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Deploy workers to production (e.g., Railway, Render)
- [ ] Set up CI/CD pipeline
- [ ] Configure backup strategy
- [ ] Set up log aggregation
- [ ] Performance testing

## 📚 Documentation

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with validation rules
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Development workflow and Claude Code infrastructure
- **[Error Handling Guide](./docs/ERROR_HANDLING.md)** - Common errors and troubleshooting
- **[Error Notes](./docs/error_notes.md)** - Recent fixes and resolved issues

## 📝 License

MIT

## 🤝 Contributing

We use epic-based development with Claude Code infrastructure:

1. **Initialize Epic**: Use `/pm:init` to start new features
2. **Follow Patterns**: See [Developer Guide](./docs/DEVELOPER_GUIDE.md) for workflow
3. **Use Agents**: Leverage specialized agents for code quality and testing
4. **Smart Commits**: Use `/commit` for validated commits

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues:

1. **Debug with Claude Code**: Use `Task agent_type="code-analyzer" description="Investigate issue"`
2. **Check Documentation**: Review [Error Handling Guide](./docs/ERROR_HANDLING.md)
3. **GitHub Issues**: Open an issue for bugs or feature requests
4. **Developer Help**: Use `/pm:help` for command assistance
