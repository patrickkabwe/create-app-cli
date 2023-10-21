import { ApolloServer } from '@apollo/server';
import { config } from 'dotenv';
import { GraphQLFormattedError } from 'graphql';
import { schema } from '~/graphql';
import { MockedContext } from './mockContext';
config();

interface BodyReponse<Results = any> {
  kind: 'single';
  singleResult: {
    data: Results;
    errors: readonly GraphQLFormattedError[];
  };
}

interface QueryResult<Results = any> {
  body: BodyReponse<Results>;
}

export const testServer = async () => {
  const server = new ApolloServer<MockedContext>({
    schema: schema,
  });

  const query = async <Response>(
    query: string,
    variables?: any,
    contextValue?: MockedContext,
  ) => {
    return (await server.executeOperation(
      { query: `query ${query}`, variables },
      { contextValue },
    )) as QueryResult<Response>;
  };

  const mutate = async <Response>(
    mutation: string,
    variables?: any,
    contextValue?: MockedContext,
  ) => {
    return (await server.executeOperation(
      { query: `mutation ${mutation}`, variables },
      { contextValue },
    )) as QueryResult<Response>;
  };

  return { query, mutate };
};
