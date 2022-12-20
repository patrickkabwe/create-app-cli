import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import {
  MockContext,
  MockedContext,
  createMockContext,
} from '~/utils/mockContext';
import { protect } from '~/middleware/protect';
import { UnAuthenticated } from '~/errors';
import { ERROR_MESSAGES } from '~/errors/errorMessages';

let mockCtx: MockContext;
let ctx: MockedContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as any as typeof ctx;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('protect', () => {
  const resolverHandler = vi.fn();
  const parent = {};
  const args = {};
  const info = {};

  it('throws UnAuthenticated error if context.user is not present', () => {
    const context = {};
    expect(() =>
      protect(resolverHandler)(parent, args, context, info),
    ).toThrowError(new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED));
  });

  it('throws UnAuthenticated error if auth header is not present', () => {
    const context = { user: {} };
    expect(() =>
      protect(resolverHandler)(parent, args, context, info),
    ).toThrowError(new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED));
  });

  it('throws UnAuthenticated error if token is not present', () => {
    const context = {
      user: {},
      req: {
        headers: {
          authorization: 'Bearer ',
        },
      },
    };
    const info = {};

    expect(() =>
      protect(resolverHandler)(parent, args, context, info),
    ).toThrowError(new UnAuthenticated(ERROR_MESSAGES.UNAUTHENTICATED));
  });

  it('calls the next resolver handler if user is authenticated', () => {
    const context = {
      user: {},
      req: {
        headers: {
          authorization: 'Bearer valid-token',
        },
      },
    };
    const info = {};

    protect(resolverHandler)(parent, args, context, info);

    expect(resolverHandler).toHaveBeenCalledWith(parent, args, context, info);
  });
});
