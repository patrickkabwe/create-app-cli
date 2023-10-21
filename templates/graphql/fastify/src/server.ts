import cookie from '@fastify/cookie'
import { gracefulShutdown, logger } from '@kazion/node-utils'
import { config } from 'dotenv'
import { apolloServer, app, fastifyApollo } from '~/app'
import { prisma } from '~/lib/prisma'
import { queueBoardPath, serverAdapter } from '~/lib/queueBoard'
import { worker } from './lib/worker'
config()

const port = Number.parseInt(process.env.PORT as string) ?? 4000

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

gracefulShutdown(signalTraps, {
  development: process.env.NODE_ENV === 'development',
  services: [
    {
      name: 'worker',
      stop: async () => {
        await worker.close()
      },
    },
    {
      name: 'database',
      stop: async () => {
        await prisma.$disconnect()
      },
    },
    {
      name: 'server',
      stop: async () => {
        // logger.info('🛑 Server is closing')
        await app.close()
      },
    },
  ],
})

startServer()
  .then(() => {
    logger.info(`🚀 Server ready at http://localhost:${port}/graphql`)
  })
  .catch((err) => {
    logger.error(err)
    process.exit(1)
  })
