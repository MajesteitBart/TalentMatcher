# 🚀 Quick Setup Guide

Follow these steps to get the Talent Matcher Agent running locally.

## Prerequisites

Make sure you have:
- ✅ Node.js 18+ installed
- ✅ Docker installed and running
- ✅ A Supabase account
- ✅ A Google Gemini API key

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Supabase client
- Google Generative AI
- LangGraph
- BullMQ
- And all other dependencies

### 2️⃣ Setup Supabase Database

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name and password

2. **Run the database migration**:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the entire contents of `supabase-migration.sql`
   - Paste and run it
   - ✅ This creates all tables, indexes, and the pgvector extension

3. **Get your API credentials**:
   - In Supabase dashboard, go to Settings > API
   - Copy:
     - Project URL
     - anon (public) key
     - service_role key (⚠️ keep this secret!)

### 3️⃣ Get Google Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key
4. Copy it for the next step

### 4️⃣ Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your credentials:
```env
# Supabase (from step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini (from step 3)
GEMINI_API_KEY=AIzaSy...

# Redis (use defaults for local)
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5️⃣ Start Redis

Redis is required for the job queue:

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker ps
```

You should see a redis container running.

### 6️⃣ Start the Background Workers

Open a **new terminal window** and run:

```bash
npm run worker:workflow
```

Keep this terminal open. You should see:
```
[INFO] Starting workflow workers...
[INFO] Workers are running and waiting for jobs
```

### 7️⃣ Start the Next.js Development Server

In your **original terminal**, run:

```bash
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000)

## ✅ Verify Installation

1. **Check the homepage**:
   - Visit http://localhost:3000
   - You should see the Talent Matcher Agent homepage

2. **Test the database connection**:
   - The app should start without errors
   - Check the Supabase dashboard to see your tables

3. **Test Redis**:
   - The workers should be running without errors

## 🧪 Testing the Workflow

### Option 1: Manual Test via Supabase Dashboard

1. **Add a test job** in Supabase:
   - Go to Table Editor > jobs
   - Insert a new row:
     - company_id: `00000000-0000-0000-0000-000000000001`
     - title: "Backend Developer"
     - description: "We need a Node.js developer..."
     - required_skills: ["Node.js", "PostgreSQL", "TypeScript"]
     - experience_level: "mid"
     - job_type: "full-time"
     - status: "active"

2. **Index the job**:
```bash
curl -X POST http://localhost:3000/api/jobs/index 
  -H "Content-Type: application/json" 
  -d '{"company_id": "00000000-0000-0000-0000-000000000001"}'
```

3. **Add a test candidate** in Supabase:
   - Go to Table Editor > candidates
   - Insert with sample CV text

4. **Create an application and reject it** to trigger the workflow

### Option 2: Test via API

See the README.md for full API documentation and curl examples.

## 🐛 Troubleshooting

### Workers not starting?
- Make sure Redis is running: `docker ps`
- Check environment variables are set
- Look for error messages in the worker terminal

### Database connection errors?
- Verify Supabase credentials in `.env.local`
- Check if the migration ran successfully
- Ensure pgvector extension is enabled

### Gemini API errors?
- Verify your API key is correct
- Check if you have API quota
- Make sure you're using a valid key

### Port already in use?
- Next.js (3000): Change in package.json dev script
- Redis (6379): Change in `.env.local` and `docker-compose.yml`

## 📚 Next Steps

Once everything is running:

1. Read through the [README.md](README.md) for detailed documentation
2. Explore the [API endpoints](README.md#-api-endpoints)
3. Check out the [workflow architecture](README.md#-workflow-architecture)
4. Review the [database schema](README.md#-database-schema)

## 🆘 Need Help?

- Check the logs in your terminal windows
- Review the code comments for implementation details
- Open an issue on GitHub

Happy matching! 🎯
