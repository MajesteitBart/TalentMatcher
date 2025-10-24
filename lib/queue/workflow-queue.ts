// lib/queue/workflow-queue.ts
import { Queue, QueueOptions } from 'bullmq'
import IORedis from 'ioredis'

// Redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
})

// Queue options
const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 3600 * 24 * 7 // Keep for 7 days
    },
    removeOnFail: {
      count: 500 // Keep last 500 failed jobs
    }
  }
}

// Create workflow queue
export const workflowQueue = new Queue('talent-matcher-workflow', queueOptions)

// Queue events
workflowQueue.on('error', (error) => {
  console.error('Workflow queue error:', error)
})

// Job indexing queue (for batch job embedding)
export const indexingQueue = new Queue('talent-matcher-indexing', queueOptions)

indexingQueue.on('error', (error) => {
  console.error('Indexing queue error:', error)
})

// Export connection for workers
export { connection as redisConnection }
