import { User } from '@prisma/client';
import { ZodError } from 'zod';
import { BadRequest, ServerError, UnAuthenticated } from '~/errors';
import { ERROR_MESSAGES } from '~/errors/errorMessages';
import { ResolverHandler, Args, OK } from '~/types';
import { UserService } from '~/modules/users/user.service';
import { decodeToken, verifyToken } from '~/utils/tokens';
import {
  UserLoginPayload,
  UserLoginSchema,
  UserPayload,
} from '~/modules/auth/auth.schema';
import { comparePassword, hashPassword } from '~/utils/passwordHash';
import { createToken } from '~/utils/tokens';
import { formatZodError } from '~/utils/formatZodError';
import { UserSchema } from '~/modules/users/user.schema';

export const registerUserHandler: ResolverHandler<Promise<OK>> = async (
  _: any,
  args: Args<UserPayload>,
  { prisma },
) => {
  try {
    const cleanedData = await UserSchema.parseAsync(args.input);

    const foundUser = await UserService.getUserByPhone(
      prisma,
      cleanedData.phoneNumber,
    );

    if (foundUser) {
      throw new BadRequest('Account already exists');
    }
    args.input.password = await hashPassword(args.input.password);
    await UserService.createUser(prisma, args.input);
    return { ok: true };
  } catch (error: any) {
    if (error instanceof ZodError) {
      let message = formatZodError(error);
      throw new BadRequest(message);
    }
    throw new ServerError(error.message);
  }
};

export const loginHandler: ResolverHandler<Promise<User>> = async (
  _,
  args: Args<UserLoginPayload>,
  cxt,
) => {
  try {
    const cleanedData = await UserLoginSchema.parseAsync(args.input);
    const user = await UserService.getUserByPhone(
      cxt.prisma,
      cleanedData.phoneNumber,
    );

    if (!user) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }

    if (!(await comparePassword(args.input.password, user!.password))) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }

    const token = await createToken(user!.id);
    const updatedUser = await UserService.updateUserToken(
      cxt.prisma,
      user!.id,
      {
        lastLogin: new Date(),
        token,
      },
    );

    cxt.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { ...updatedUser };
  } catch (error: any) {
    if (error instanceof ZodError) {
      let message = formatZodError(error);
      throw new Error(message);
    }
    throw error;
  }
};

export const verifyTokenHandler: ResolverHandler<Promise<User>> = async (
  __,
  _args,
  { req, res, prisma },
) => {
  const authHeader = req?.cookies?.token;
  const inputToken = _args?.input?.token;  

  try {
    if (!inputToken && !authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const { uid } = await verifyToken(authHeader || inputToken);
    const user = await UserService.getUserById(prisma, uid);

    res.cookie('token', authHeader || inputToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return user;
  } catch (error: any) {
    throw new UnAuthenticated(error.message);
  }
};

export const logoutHandler: ResolverHandler<Promise<OK>> = async (
  __,
  _,
  ctx,
) => {
  try {
    const authHeader = ctx?.req?.cookies?.token;
    if (!authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED);
    }
    const { uid } = decodeToken(authHeader);
    const user = await UserService.getUserById(ctx.prisma, uid);
    user.token = null;
    await UserService.updateUserToken(ctx.prisma, user.id, user);
    ctx.res.clearCookie('token', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
};
