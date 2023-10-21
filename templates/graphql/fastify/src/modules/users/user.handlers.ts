import type { User } from '@prisma/client'
import { ServerError } from '~/errors'
import { pubsub } from '~/lib/pubsub'
import type { Args, ID, ResolverHandler } from '~/types/server.types'

export const meHandler: ResolverHandler = async (__, _, ctx) => {
  return ctx.user
}

export const inviteUserHandler: ResolverHandler = async (
  _: any,
  args: Partial<Args<User, ID>>,
) => {
  try {
    await pubsub.publish('USER_INVITE', { userInvite: args.input })
    return { ok: true }
  } catch (error) {
    throw new ServerError()
  }
}
