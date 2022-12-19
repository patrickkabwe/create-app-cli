import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import { UserResponse } from '~/types';
import { testServer } from '~/utils/testServer';
import {
  MockContext,
  MockedContext,
  createMockContext,
} from '~/utils/mockContext';
import { UserService } from '~/modules/users/user.service';
import { protect } from '~/middleware/protect';
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

// vi.mock('~/middleware/protect', () => {
//   return {
//     protect: vi.fn().mockImplementationOnce((fn: any) => fn),
//   };
// });

describe('protect middleware', () => {
  const mockUserPayload = {
    id: 'dbcb692f-8259-42d9-b599-2356c9625bce',
    name: 'test',
    email: 'test@gmail.com',
    phoneNumber: '0979609500',
    password: 'test10',
    avatar: 'test',
  };

  const q = `
    GetMe{
      me {
        id
        name
        email
        phoneNumber
      }
    }
  `;

  it('should throw error if no user in context', async () => {
    mockCtx.prisma.user.findUnique.mockResolvedValue(null);

    await UserService.getUserById(
      mockCtx.prisma,
      'dbcb692f-8259-42d9-b599-2356c9625bce',
    );

  
    const { query } = await testServer();
    const { body } = await query(q, null, mockCtx);

    expect(body.singleResult.errors[0].message).toBe('You are not authenticated');
  });
  it('should throw error if no cookie in authrization header or cookie', () => {});
  it('should call next function if cookie in authrization header or cookie', () => {});
});
