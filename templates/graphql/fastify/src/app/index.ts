import { ApolloServer, type BaseContext } from '@apollo/server'
import fastifyApollo, {
  fastifyApolloDrainPlugin,
} from '@as-integrations/fastify'

import Fastify from 'fastify'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { schema } from '~/_graphql'

const app = Fastify()

const wsServer = new WebSocketServer({
  server: app.server,
  path: '/graphql',
})
const serverCleanup = useServer({ schema }, wsServer)
const apolloServer = new ApolloServer<BaseContext>({
  schema,
  plugins: [
    fastifyApolloDrainPlugin(app),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

export { apolloServer, app, fastifyApollo }
