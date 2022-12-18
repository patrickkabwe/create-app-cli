import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import { Logout } from '~/types';
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

describe('logout', () => {
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
    Logout{
      logout{ ok }
    }
  `;

  it('should fail to logout if token not in cookie', async () => {
    mockCtx.prisma.user.create.mockResolvedValue(mockUserPayload as User);
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUserPayload as User);

    const { mutate } = await testServer();

    const { body } = await mutate<Logout>(q, null, {
      ...mockCtx,
      //@ts-ignore
      req: { cookies: {} },
    });

    const results = body.singleResult;
    expect(results.errors).toBeUndefined();
    expect(results.data.logout.ok).toEqual(false);
  });

  it('should logout if token in cookie', async () => {
    mockCtx.prisma.user.create.mockResolvedValue(mockUserPayload as User);
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUserPayload as User);

    const newUser = await UserService.createUser(
      mockCtx.prisma,
      mockUserPayload as any,
    );

    const { mutate } = await testServer();

    const { body } = await mutate<Logout>(q, null, {
      ...mockCtx,
      //@ts-ignore
      req: {
        cookies: {
          token: newUser.token,
        },
      },
    });

    const results = body.singleResult;
    expect(results.errors).toBeUndefined();
    expect(results.data.logout.ok).toEqual(true);
  });
});
