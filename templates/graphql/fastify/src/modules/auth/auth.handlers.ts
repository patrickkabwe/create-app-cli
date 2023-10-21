import {
  comparePassword,
  createJWT,
  decodeJWT,
  formatZodError,
  hashPassword,
  verifyJWT,
} from '@kazion/node-utils'
import { ZodError } from 'zod'
import { BadRequest, ServerError, UnAuthenticated } from '~/errors'
import { ERROR_MESSAGES } from '~/errors/errorMessages'
import {
  UserLoginSchema,
  type UserLoginPayload,
  type UserPayload,
} from '~/modules/auth/auth.schema'
import { UserSchema } from '~/modules/users/user.schema'
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '~/modules/users/user.services'
import type { Args, ResolverHandler } from '~/types/server.types'

export const registerUserHandler: ResolverHandler = async (
  _: any,
  args: Args<UserPayload>,
  { prisma },
) => {
  try {
    const cleanedData = await UserSchema.parseAsync(args.input)

    const foundUser = await getUserByEmail(prisma, cleanedData.phoneNumber)

    if (foundUser) {
      throw new BadRequest('Account already exists')
    }
    args.input.password = await hashPassword(args.input.password)
    await createUser(prisma, args.input)
    return { ok: true }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = formatZodError(error)
      throw new BadRequest(message)
    }
    throw new ServerError()
  }
}

export const loginHandler: ResolverHandler = async (
  _,
  args: Args<UserLoginPayload>,
  cxt,
) => {
  try {
    const cleanedData = await UserLoginSchema.parseAsync(args.input)
    const user = await getUserByEmail(cxt.prisma, cleanedData.phoneNumber)

    if (!user) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }

    if (!(await comparePassword(args.input.password, user.password))) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }

    const token = await createJWT(user.id, {
      secret: process.env.SECRET_KEY as string,
    })
    const updatedUser = await updateUser(cxt.prisma, user.id, {
      lastLogin: new Date(),
    })

    void cxt.reply.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return { ...updatedUser }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = formatZodError(error)
      throw new BadRequest(message)
    }
    throw new ServerError()
  }
}

export const verifyTokenHandler: ResolverHandler = async (
  __,
  _args,
  { req, reply, prisma },
) => {
  const authHeader = req?.cookies?.token
  const inputToken = _args?.input?.token

  if (!inputToken && !authHeader) {
    throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
  }
  const { uid } = await verifyJWT(authHeader ?? inputToken, {
    secret: process.env.SECRET_KEY as string,
  })
  const user = await getUserById(prisma, uid)

  void reply.cookie('token', authHeader ?? inputToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
  return user
}

export const logoutHandler: ResolverHandler = async (
  __,
  _,
  { prisma, reply },
) => {
  try {
    const authHeader = reply?.cookies?.token
    if (!authHeader) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }
    const { uid } = decodeJWT(authHeader)
    const user = await getUserById(prisma, uid)
    if (!user) {
      throw new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED)
    }
    await updateUser(prisma, user.id, user)
    void reply.clearCookie('token', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    return { ok: true }
  } catch (error) {
    return { ok: false }
  }
}
