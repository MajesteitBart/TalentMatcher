// workers/workflow-worker.ts
// Load environment variables from .env as early as possible so other modules
// that read process.env (like lib/gemini/client.ts) have the values available.
import 'dotenv/config'

import { workflowWorker, indexingWorker } from '@/lib/queue/workers'
import { logger } from '@/lib/utils/logger'


logger.info('Starting workflow workers...')

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down workers...')
  
  await workflowWorker.close()
  await indexingWorker.close()
  
  logger.info('Workers shut down successfully')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

logger.info('Workers are running and waiting for jobs')
