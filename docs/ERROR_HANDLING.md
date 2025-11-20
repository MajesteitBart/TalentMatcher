# Error Handling Guide

This guide covers common errors, troubleshooting steps, and best practices for the Talent Matcher system.

## Table of Contents

- [API Error Response Format](#api-error-response-format)
- [Common Validation Errors](#common-validation-errors)
- [Database Connection Issues](#database-connection-issues)
- [Worker and Queue Problems](#worker-and-queue-problems)
- [AI/Integration Errors](#aiintegration-errors)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)
- [Recent Fixes](#recent-fixes)

## API Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE",
    "details": [...] // Optional validation error details
  }
}
```

### Error Codes Reference

| Error Code | HTTP Status | Description | Common Causes |
|------------|-------------|-------------|---------------|
| `VALIDATION_ERROR` | 400 | Request data validation failed | Invalid data format, missing required fields |
| `NOT_FOUND` | 404 | Resource not found | Invalid ID, resource doesn't exist |
| `UNAUTHORIZED` | 401 | Authentication required | Missing/invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions | User lacks required access |
| `DATABASE_ERROR` | 500 | Database operation failed | Connection issues, constraint violations |
| `INTERNAL_ERROR` | 500 | Internal server error | Unexpected server errors |

## Common Validation Errors

### Job Creation Validation Error

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid request data",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["company_id"],
        "message": "Invalid company ID format"
      },
      {
        "path": ["experience_level"],
        "message": "Invalid enum value. Expected 'entry', 'mid', 'senior', 'lead', or 'executive'"
      }
    ]
  }
}
```

**Solution:**
- Ensure `company_id` is a valid UUID format: `00000000-0000-0000-0000-000000000001`
- Use valid enum values for `experience_level`: `entry`, `mid`, `senior`, `lead`, `executive`
- Keep job description under 20,000 characters

**Fixed in:** November 2025 (See [error_notes.md](./error_notes.md))

### Application Status Validation Error

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid request data",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["status"],
        "message": "Invalid enum value"
      }
    ]
  }
}
```

**Solution:**
- Use valid status values: `applied`, `under_review`, `interview_scheduled`, `offer_extended`, `hired`, `rejected`
- Provide `rejection_reason` when status is `rejected`

## Database Connection Issues

### Supabase Connection Failed

**Symptoms:**
- API returns 500 errors with database connection messages
- Worker processes fail to start
- Cannot authenticate users

**Troubleshooting Steps:**

1. **Check Environment Variables:**
```bash
cat .env.local | grep SUPABASE
```

2. **Verify Supabase Status:**
```bash
npx supabase status
```

3. **Test Connection:**
```javascript
// Test script: test-db-connection.js
import { createAdminClient } from './lib/supabase/admin'

async function testConnection() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('companies').select('count')

    if (error) {
      console.error('Database error:', error)
    } else {
      console.log('Database connection successful')
    }
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

testConnection()
```

4. **Common Solutions:**
   - Verify Supabase project URL and keys
   - Check network connectivity
   - Ensure RLS policies don't block admin operations
   - Restart services after fixing env variables

### Database Schema Issues

**Symptoms:**
- Column not found errors
- Type mismatch errors
- Constraint violations

**Solutions:**

1. **Run Migrations:**
```bash
npx supabase db push
```

2. **Check Schema:**
```bash
npx supabase db diff --schema public
```

3. **Reset Local Database:**
```bash
npx supabase db reset
```

## Worker and Queue Problems

### Workers Not Starting

**Symptoms:**
- Background jobs not processing
- API calls to workflow endpoints hang
- Redis connection errors

**Troubleshooting:**

1. **Check Redis Status:**
```bash
docker ps | grep redis
docker-compose logs redis
```

2. **Verify Redis Configuration:**
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

3. **Check Worker Logs:**
```bash
# Start worker with verbose logging
DEBUG=* npm run worker:workflow
```

4. **Common Solutions:**
   - Ensure Redis is running: `docker-compose up -d`
   - Check Redis host/port in environment variables
   - Verify BullMQ queue configuration
   - Restart workers after fixing Redis issues

### Jobs Stuck in Queue

**Symptoms:**
- Workflow executions stuck in "running" state
- Jobs not being processed
- Queue growing without processing

**Solutions:**

1. **Check Queue Status:**
```javascript
// Script: check-queue.js
import { workflowQueue } from './lib/queue/workflow-queue'

async function checkQueue() {
  const waiting = await workflowQueue.getWaiting()
  const active = await workflowQueue.getActive()
  const failed = await workflowQueue.getFailed()

  console.log('Waiting jobs:', waiting.length)
  console.log('Active jobs:', active.length)
  console.log('Failed jobs:', failed.length)
}

checkQueue()
```

2. **Clean Up Failed Jobs:**
```bash
# Clear failed jobs
npx ts-node scripts/clean-failed-jobs.ts
```

3. **Restart Workers:**
```bash
# Stop all workers
pkill -f "worker"

# Restart workers
npm run worker:workflow
npm run worker:indexing
```

## AI/Integration Errors

### Gemini API Errors

**Symptoms:**
- CV parsing failures
- Embedding generation errors
- Analysis generation timeouts

**Common Error Messages:**
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "API quota exceeded"
}
```

**Solutions:**

1. **Check API Key:**
```bash
echo $GEMINI_API_KEY | head -c 20
```

2. **Verify Quota:**
   - Check Google AI Studio dashboard
   - Monitor usage patterns
   - Consider upgrading quota if needed

3. **Retry Logic:**
   - The system includes automatic retry with exponential backoff
   - Check logs for retry patterns
   - Monitor failure rates

### Workflow Timeout Errors

**Symptoms:**
- Workflow executions timing out after 30 seconds
- Partial matches returned
- Incomplete analysis

**Solutions:**

1. **Increase Timeout:**
```typescript
// In lib/langgraph/graph.ts
const workflow = new StateGraph(WorkflowState)
  .setTimeout(60000) // Increase to 60 seconds
```

2. **Optimize Performance:**
   - Check database query performance
   - Optimize vector search indexes
   - Monitor AI response times

3. **Monitor Workflow:**
```bash
curl http://localhost:3000/api/workflow/status/[workflow_id]
```

## Environment Configuration Issues

### Missing Environment Variables

**Symptoms:**
- Application fails to start
- Undefined errors for API keys
- Authentication failures

**Solution:**

1. **Check Required Variables:**
```bash
# List all required environment variables
grep -r "process.env." . --include="*.ts" --include="*.js" | cut -d'"' -f2 | sort | uniq
```

2. **Validate .env.local:**
```bash
# Script: validate-env.js
require('dotenv').config()

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'REDIS_HOST',
  'REDIS_PORT'
]

const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('Missing environment variables:', missing)
  process.exit(1)
}

console.log('All environment variables present')
```

3. **Fix Variable Issues:**
   - Copy from `.env.example`
   - Update with actual values
   - Restart services after changes

### Port Conflicts

**Symptoms:**
- Next.js server fails to start
- Port already in use errors
- Services conflicting with each other

**Solutions:**

1. **Find Process Using Port:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

2. **Use Different Ports:**
```bash
# Start on different port
PORT=3001 npm run dev
```

3. **Clean Start:**
```bash
# Kill all Node processes
pkill -f node

# Start fresh
npm run dev:concurrent
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- API calls taking > 5 seconds
- Frontend loading slowly
- Database query timeouts

**Debugging Steps:**

1. **Check Database Performance:**
```sql
-- Slow queries in Supabase
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

2. **Monitor Vector Search:**
```javascript
// Add timing to vector search
console.time('vector-search')
const results = await vectorSearch(params)
console.timeEnd('vector-search')
```

3. **Profile API Endpoints:**
```bash
# Use curl with timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/jobs
```

### Memory Leaks

**Symptoms:**
- Memory usage increasing over time
- Workers crashing unexpectedly
- Out of memory errors

**Solutions:**

1. **Monitor Memory Usage:**
```bash
# Monitor Node.js process
ps aux | grep node
top -p <PID>
```

2. **Check for Leaks:**
```bash
# Use Node.js inspector
node --inspect app.js
```

3. **Common Causes:**
   - Unclosed database connections
   - Large objects not garbage collected
   - Event listener leaks

## Debugging Tools

### Claude Code Agents

Use specialized agents for debugging:

```bash
# Analyze code issues
Task agent_type="code-analyzer" description="Debug authentication flow"

# Check test failures
Task agent_type="test-runner" description="Analyze test failures"

# Review logs
Task agent_type="file-analyzer" description="Summarize error logs"
```

### Logging

The system includes structured logging:

```javascript
import { logger } from '@/lib/utils/logger'

// Log with context
logger.info('User action', {
  userId,
  action: 'job_create',
  metadata: { jobId, company_id }
})

logger.error('API error', {
  error: error.message,
  stack: error.stack,
  userId,
  endpoint
})
```

### Health Checks

Monitor system health:

```bash
# API Health
curl http://localhost:3000/api/health

# Database Health
curl http://localhost:3000/api/health/db

# Redis Health
curl http://localhost:3000/api/health/redis
```

## Recent Fixes

### November 2025 Fixes

1. **Job Creation Validation Error**
   - **Issue**: Company ID and experience level validation failures
   - **Fix**: Updated Zod schema with proper UUID regex and enum validation
   - **Status**: ✅ RESOLVED

2. **Application Status Authentication**
   - **Issue**: Authentication checks failing in status endpoint
   - **Fix**: Improved authentication validation in API routes
   - **Status**: ✅ RESOLVED

3. **TypeScript ZodError Handling**
   - **Issue**: TypeScript errors when handling Zod validation errors
   - **Fix**: Added proper type casting for ZodError instances
   - **Status**: ✅ RESOLVED

4. **Job Description Length Limit**
   - **Issue**: 5,000 character limit too restrictive
   - **Fix**: Increased limit to 20,000 characters
   - **Status**: ✅ RESOLVED

See [error_notes.md](./error_notes.md) for detailed information about these fixes.

## Getting Help

### Self-Service Debugging

1. **Check Error Logs:**
```bash
tail -f logs/application.log
```

2. **Use Claude Code:**
```bash
Task agent_type="code-analyzer" description="Investigate recent errors"
```

3. **Run Health Checks:**
```bash
npm run health:check
```

### Community Support

1. **GitHub Issues**: Report bugs or request features
2. **Documentation**: Check guides and API reference
3. **Error Notes**: Review recent fixes and workarounds

### Emergency Procedures

For critical production issues:

1. **Check Status Dashboard**
2. **Review Recent Deployments**
3. **Roll Back if Necessary**
4. **Notify Team**
5. **Document Incident**

Remember: Most issues are related to environment configuration or database connectivity. Always check these first before diving into complex debugging.