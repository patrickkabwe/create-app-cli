import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from '~/_graphql/resolvers'
import { typeDefs } from '~/_graphql/typeDefs'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
