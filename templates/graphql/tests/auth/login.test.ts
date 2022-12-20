// @ts-nocheck
import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import { LoginUserResponse } from '~/types';
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
  vi.clearAllMocks();
});

describe('login', () => {
  let newUser: User;
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
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUserPayload as User);
    const { mutate } = await testServer();

    const { body } = await mutate<LoginUserResponse>(
      q,
      { input: {} },
      { prisma: mockCtx.prisma },
    );

    const results = body.singleResult;

    expect(results.errors).toBeDefined();
  });

  it('should fail if password dont match', async () => {
    const hashedPassword = await hashPassword(mockUserPayload.password);
    const returnValue = {
      ...mockUserPayload,
      password: hashedPassword,
    };
    mockCtx.prisma.user.create.mockResolvedValue(returnValue as User);
    mockCtx.prisma.user.findUnique.mockResolvedValue(returnValue as User);

    newUser = await UserService.createUser(mockCtx.prisma, returnValue);

    const { mutate } = await testServer();

    const { body } = await mutate<LoginUserResponse>(
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

  it('should fail if user not found', async () => {
    mockCtx.prisma.user.findUnique.mockResolvedValue(null);

    const { mutate } = await testServer();

    const { body } = await mutate<LoginUserResponse>(
      q,
      {
        input: {
          phoneNumber: '0979609500',
          password: 'test10',
        },
      },
      { prisma: mockCtx.prisma },
    );

    const results = body.singleResult;

    expect(results.errors).toBeDefined();
  });

  it('should login user', async () => {
    mockCtx.prisma.user.update.mockResolvedValue({ ...newUser, token: 'test' });
    mockCtx.prisma.user.findUnique.mockResolvedValue(newUser);

    const updatedUser = await UserService.updateUserToken(
      mockCtx.prisma,
      newUser.id,
      {
        token: 'test',
      },
    );

    const { mutate } = await testServer();

    const { body } = await mutate<LoginUserResponse>(
      q,
      {
        input: { phoneNumber: newUser.phoneNumber, password: 'test10' },
      },
      {
        ...mockCtx,
        res: {
          cookie: vi.fn(),
        },
      },
    );
    const results = body.singleResult;

    expect(results.data.loginUser).toEqual({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
    });
  });
});
