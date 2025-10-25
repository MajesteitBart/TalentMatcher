// workers/indexing-worker.ts
// Load environment variables from .env as early as possible so other modules
// that read process.env (like lib/gemini/client.ts) have the values available.
import 'dotenv/config'

import { indexingWorker } from '@/lib/queue/workers'
import { logger } from '@/lib/utils/logger'

// Start the indexing worker
logger.info('Starting indexing worker...')

indexingWorker.on('completed', (job) => {
  logger.info('Indexing job completed', { jobId: job.id })
})

indexingWorker.on('failed', (job, error) => {
  logger.error('Indexing job failed', {
    jobId: job?.id,
    error: error.message
  })
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down indexing worker...')
  await indexingWorker.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Shutting down indexing worker...')
  await indexingWorker.close()
  process.exit(0)
})