import { Queue } from 'bullmq';
import { REDIS_CONNECTION } from './redis'
import { QueueEvent } from '../constants/queue.events'

const queueOptions = {
  connection: REDIS_CONNECTION as any,
  defaultJobOptions: {
    timestamp: Date.now(),
  },
};

export const notificationQueue = new Queue(
  QueueEvent.NOTIFICATION_QUEUE_NAME,
  queueOptions,
);

export async function addJob () {
  await notificationQueue.add('myJobName', { foo: 'bar' });
}
