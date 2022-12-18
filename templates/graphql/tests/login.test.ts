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
import { hashPassword } from '~/utils/passwordHash';

let mockCtx: MockContext;
let ctx: MockedContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as any as typeof ctx;
});

afterEach(() => {
  vitest.clearAllMocks();
});

describe('login', () => {
  const mockUserPayload = {
    id: uuidV4(),
    name: 'test',
    email: 'test@gmail.com',
    phoneNumber: '0979609500',
    password: 'test10',
    avatar: 'test',
  };

  const q = `
    LoginUser($input: UserLoginInput!){
      loginUser(input: $input){
        id
        name
        email
        phoneNumber
      }
    }
  `;

  it('should fail if no phone and password', async () => {
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValue(
      mockUserPayload as User,
    );
    const { mutate } = await testServer();

    const { body } = await mutate<RegisterUserResponse>(
      q,
      { input: {} },
      { prisma: mockCtx.prisma },
    );

    const results = body.singleResult;

    expect(results.errors).toBeDefined();
  });

  it('should fail if password dont match', async () => {
    mockCtx.prisma.user.create.mockResolvedValue(mockUserPayload as User);
    const hashedPassword = await hashPassword(mockUserPayload.password);
    const newUser = await UserService.createUser(mockCtx.prisma, {
      ...mockUserPayload,
      password: hashedPassword,
    });
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValue({
      ...mockUserPayload,
      password: hashedPassword,
    } as User);

    const { mutate } = await testServer();

    const { body } = await mutate<RegisterUserResponse>(
      q,
      {
        input: {
          phoneNumber: newUser.phoneNumber,
          password: 'test',
        },
      },
      { prisma: mockCtx.prisma },
    );

    const results = body.singleResult;
    expect(results.errors).toBeDefined();
    expect(results.errors[0].message).toBe('You are not authenticated');
  });
});
