import { expect, it, describe, beforeEach, afterEach, vitest } from 'vitest';
import { RegisterUserResponse } from '~/types';
import { testServer } from '~/utils/testServer';
import {
  MockContext,
  MockedContext,
  createMockContext,
} from '~/utils/mockContext';
import { v4 as uuidV4 } from 'uuid';
import { UserService } from '~/modules/users/user.service';
import { User } from '@prisma/client';

let mockCtx: MockContext;
let ctx: MockedContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as any as typeof ctx;
});

afterEach(() => {
  vitest.clearAllMocks();
});

describe('register', () => {
  const mockUserPayload = {
    id: uuidV4(),
    name: 'test',
    email: 'test@gmail.com',
    phoneNumber: '0979609500',
    password: 'test10',
    avatar: 'test',
  };
  const q = `
    RegisterUser($input: UserPayload!){
      registerUser(input: $input){ ok }
    }
  `;
  
  it('should throw an error with messge "Account already exists"', async () => {
    mockCtx.prisma.user.create.mockResolvedValueOnce(mockUserPayload as User);
    const newUser = await UserService.createUser(
      mockCtx.prisma,
      mockUserPayload,
    );
    // @ts-ignore
    delete mockUserPayload.id;

    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(
      mockUserPayload as User,
    );

    const { mutate } = await testServer();

    const { body } = await mutate<RegisterUserResponse>(
      q,
      { input: mockUserPayload },
      { prisma: mockCtx.prisma },
    );
    const results = body.singleResult;

    expect(newUser).toEqual({
      ...mockUserPayload,
    });

    expect(results.errors[0].message).toBe('Account already exists');
  });

  it('should throw an error when there are missing fields i.e email,password, phoneNumber and name', async () => {
    const { mutate } = await testServer();

    const { body } = await mutate<RegisterUserResponse>(
      q,
      {
        input: {
          avatar: mockUserPayload.avatar,
        },
      },
      { prisma: mockCtx.prisma },
    );
    const results = body.singleResult;

    expect(results.errors).toBeDefined();
  });

  it('should register a new user', async () => {
    const { mutate } = await testServer();
    const { body } = await mutate<RegisterUserResponse>(
      q,
      { input: mockUserPayload },
      { prisma: mockCtx.prisma },
    );
    const results = body.singleResult;
    expect(results.errors).toBeUndefined();
    expect(results.data.registerUser.ok).toBe(true);
  });
});
