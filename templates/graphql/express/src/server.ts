import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import { WebSocketServer } from 'ws';
import { prisma } from '~/lib/db.server';
import { UserService } from '~/modules/users/user.service';
import { logger } from '~/utils/logger';
import { verifyToken } from '~/utils/tokens';
import { UnAuthenticated } from './errors';
import { ERROR_MESSAGES } from './errors/errorMessages';
import { schema } from './graphql';
config();

interface MyContext {
  token?: String;
}

interface ExpressContext {
  req: Request;
  res: Response;
}

const ctx = async ({ req, res }: ExpressContext) => {
  let user = null;
  try {
    const authHeader =
      req?.cookies?.token || req?.headers.authorization || undefined;

    if (!authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }

    const authToken = authHeader.replace('Bearer ', '');
    if (authToken) {
      const userId = await verifyToken(authToken);

      if (userId?.uid) {
        user = await UserService.getUserById(prisma, userId?.uid as string);
      }
    }
    user = user || null;
  } catch (error) {
    user = null;
  }

  return { req, res, user, prisma };
};

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
    host: '0.0.0.0',
  });
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer<MyContext>({
    schema,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    introspection: process.env.NODE_ENV !== 'production',
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    logger,
    nodeEnv: process.env.NODE_ENV,
    formatError(formattedError, error: any) {
      logger.error(error);
      // const newError = {
      //   message: formattedError.message,
      //   extensions: {
      //     code: formattedError.extensions?.code,
      //     status: error.extensions?.http?.status,
      //   },
      // };
      return formattedError;
    },
  });

  await server.start();
  app.use(
    '/graphql',
    cookieParser(),
    cors<cors.CorsRequest>({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: ctx,
    }),
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve),
  );
  logger.info(`🚀 Server ready at http://localhost:4000/graphql`);
}

startApolloServer();
