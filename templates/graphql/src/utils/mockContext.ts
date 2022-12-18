import { PrismaClient } from '@prisma/client';
import { BaseContext } from '@apollo/server';
import { Request, Response } from 'express';

import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

export interface MockedContext extends BaseContext {
  prisma: PrismaClient;
  req?: Request;
  res?: Response;
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};
