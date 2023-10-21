import type { PrismaClient, User } from '@prisma/client'
import type { FastifyReply, FastifyRequest } from 'fastify'

export interface Parent {}

export interface Args<T = any, ID = any> {
  input: T
  id: ID
}

export type ID = string

export interface Context {
  user: User
  req: FastifyRequest
  reply: FastifyReply
  prisma: PrismaClient
}

export interface Info {
  fieldName: string
}

export type ResolverHandler = (
  parent: Parent,
  args: Args<any>,
  context: Context,
  info: Info,
) => any
