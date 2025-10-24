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

### 5. Start the Workers

In a separate terminal:

```bash
npm run worker:workflow
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

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

## 🧪 Testing

To test the workflow:

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

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues, please open a GitHub issue.
