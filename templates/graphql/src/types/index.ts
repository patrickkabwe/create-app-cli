import { PrismaClient, User } from '@prisma/client';
import { Request, Response } from 'express';

export interface Parent {}

export interface Args<T = any, ID = any> {
  input: T;
  id: ID;
}

export type ID = string;
export interface Context {
  user: User | null;
  req: Request;
  res: Response;
  prisma: PrismaClient;
}
export interface Info {
  fieldName: string;
}

export type ResolverHandler<ReturnType = any> = (
  parent: Parent,
  args: Args<any>,
  context: Context,
  info: Info,
) => ReturnType;

export interface OK {
  ok: boolean;
}

// generic response types

// success register user response
export interface RegisterUserResponse {
  registerUser: OK;
}
