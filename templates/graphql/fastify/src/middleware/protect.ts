import { UnAuthenticated } from '~/errors'
import { ERROR_MESSAGES } from '~/errors/errorMessages'
import type {
  Args,
  Context,
  Info,
  Parent,
  ResolverHandler,
} from '~/types/server.types'

type ResolverMiddleware = (next: ResolverHandler) => any

export const protect: ResolverMiddleware = (next) => {
  return (parent: Parent, args: Args<any>, context: Context, info: Info) => {
    if (!context.user) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }
    const authHeader =
      context.req?.cookies?.token ??
      context.req?.headers.authorization ??
      undefined
    if (!authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }

    return next(parent, args, context, info)
  }
}
