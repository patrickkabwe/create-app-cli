import { pubsub } from '~/lib/pubsub'
import { protect } from '~/middleware/protect'
import { inviteUserHandler, meHandler } from './user.handlers'

export const userResolvers = {
  Query: {
    me: protect(meHandler),
  },

  Mutation: {
    userInvite: inviteUserHandler,
  },

  Subscription: {
    userInvite: {
      subscribe: () => pubsub.asyncIterator(['USER_INVITE']),
    },
  },
}
