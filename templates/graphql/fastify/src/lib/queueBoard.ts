import { notificationQueue } from './queue'
import { FastifyAdapter } from '@bull-board/fastify'
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

const queueBoardPath = '/ui';
const serverAdapter = new FastifyAdapter();

createBullBoard({
  queues: [new BullMQAdapter(notificationQueue)],
  serverAdapter,
});

export { serverAdapter, queueBoardPath }
