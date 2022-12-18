import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import { VerifyToken } from '~/types';
import { testServer } from '~/utils/testServer';
import {
  MockContext,
  MockedContext,
  createMockContext,
} from '~/utils/mockContext';
import { UserService } from '~/modules/users/user.service';
import { User } from '@prisma/client';

let mockCtx: MockContext;
let ctx: MockedContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as any as typeof ctx;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('login', () => {
  const mockUserPayload = {
    id: 'dbcb692f-8259-42d9-b599-2356c9625bce',
    name: 'test',
    email: 'test@gmail.com',
    phoneNumber: '0979609500',
    password: 'test10',
    avatar: 'test',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJkYmNiNjkyZi04MjU5LTQyZDktYjU5OS0yMzU2Yzk2MjViY2UifQ.OXvf4NWhmkb4h6fs66nbaKI_ef_VO1Cs7wbZuFGkY7k',
  };

  const q = `
    VerifyToken($input: VerifyTokenInput!){
      verifyToken(input: $input){
        id
        name
        email
        phoneNumber
      }
    }
  `;

  it('should return user with token as input', async () => {
    mockCtx.prisma.user.create.mockResolvedValue(mockUserPayload as User);
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUserPayload as User);
    const newUser = await UserService.createUser(
      mockCtx.prisma,
      mockUserPayload as any,
    );
    const { mutate } = await testServer();
    const { body } = await mutate<VerifyToken>(
      q,
      {
        input: { token: newUser.token },
      },
      { prisma: mockCtx.prisma },
    );

    const results = body.singleResult;
    expect(results.errors).toBeUndefined();
    expect(results.data.verifyToken).toBeDefined();
    expect(results.data.verifyToken).toEqual({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
    });
  });

  it('should return user with token in cookie', async () => {
    mockCtx.prisma.user.create.mockResolvedValue(mockUserPayload as User);
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUserPayload as User);
    const newUser = await UserService.createUser(
      mockCtx.prisma,
      mockUserPayload as any,
    );
    const { mutate } = await testServer();
    const { body } = await mutate<VerifyToken>(
      q,
      {
        input: {},
      },
      {
        ...mockCtx,
        // @ts-ignore
        req: { ...mockCtx.req, cookies: { token: newUser.token } },
      },
    );

    const results = body.singleResult;
    expect(results.errors).toBeUndefined();
    expect(results.data.verifyToken).toBeDefined();
    expect(results.data.verifyToken).toEqual({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
    });
  });

  it('should return error if no token in header or cookie', async () => {
    const { mutate } = await testServer();
    const { body } = await mutate<VerifyToken>(
      q,
      { input: {} },
      {
        ...mockCtx,
        // @ts-ignore
        req: { ...mockCtx.req, cookies: {} },
      },
    );

    const results = body.singleResult;
    expect(results.errors[0].message).toBe('You are not authenticated');
  });
});
