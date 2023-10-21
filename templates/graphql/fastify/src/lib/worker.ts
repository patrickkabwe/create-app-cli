import { Worker } from 'bullmq'
import { REDIS_CONNECTION } from './redis'
import { QueueEvent } from '../constants/queue.events'
import { logger } from '@kazion/node-utils'

export const worker = new Worker(QueueEvent.NOTIFICATION_QUEUE_NAME, async (job) => {
  return {
    name: job.name,
    data: job.data,
  }
}, {
  connection: REDIS_CONNECTION,
})

worker.on('ready', () => {
  logger.info('worker ready')
})

worker.on('completed', (job, result) => {
  logger.info(result.name, {
    metaData: result.data,
  })
})

worker.on('failed', (job, err) => {
  logger.error(err.name, {
    metaData: job?.data,
    error: err,
  })
})
