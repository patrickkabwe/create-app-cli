import { UnAuthenticated } from '~/errors';
import { ERROR_MESSAGES } from '~/errors/errorMessages';
import { Args, Context, Info, Parent, ResolverHandler } from '~/types';

type ResolverMiddleware = (next: ResolverHandler<any>) => any;

export const protect: ResolverMiddleware = (next) => {
  return (parent: Parent, args: Args<{}>, context: Context, info: Info) => {
    if (!context.user) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const authHeader =
      context.req?.cookies?.token ||
      context.req?.headers.authorization ||
      undefined;
    if (!authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    //TODO:verify token

    return next(parent, args, context, info);
  };
};
