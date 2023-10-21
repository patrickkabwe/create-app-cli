import cookie from '@fastify/cookie'
import { apolloServer, app, fastifyApollo } from './app'
import { queueBoardPath, serverAdapter } from './lib/queueBoard'
import { worker } from './lib/worker'
import { logger } from './utils/logger'

const port = 4200

const startServer = async () => {
  await apolloServer.start()
  await app.register(serverAdapter.registerPlugin(), {
    prefix: queueBoardPath,
    basePath: queueBoardPath,
  })
  await app.register(fastifyApollo(apolloServer))
  await app.register(cookie, {
    secret: process.env.SECRET_KEY as string,
  })
  serverAdapter.setBasePath(queueBoardPath)

  if (!worker.isRunning()) {
    await worker.run()
  }

  await app.listen({
    port,
    host: '0.0.0.0',
  })
}

const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']

signalTraps.forEach((type) => {
  process.once(type, () => {
    shutdown(type).catch((err) => {
      logger.error(err)
      process.exit(1)
    })
  })
})

process.on('uncaughtException', (err) => {
  // TODO: send email to admin
  logger.error(err)
  shutdown('uncaughtException').catch((err) => {
    logger.error(err)
    process.exit(1)
  })
})

process.on('unhandledRejection', (err) => {
  // TODO: send email to admin
  logger.error(err)
  shutdown('unhandledRejection').catch((err) => {
    logger.error(err)
    process.exit(1)
  })
})

async function shutdown(signal: string) {
  try {
    logger.info('🛑 Server is shutting down')
    // await prisma.$disconnect();
    logger.info('🛑 Prisma disconnected')
    await worker.close()
    logger.info('🛑 Worker closed')
    process.kill(process.pid, signal)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

startServer()
  .then(() => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${port}/subscriptions`,
    )
  })
  .catch((err) => {
    logger.error(err)
    process.exit(1)
  })
