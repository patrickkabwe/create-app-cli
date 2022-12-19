// @ts-nocheck
import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { ERROR_MESSAGES } from './errorMessages';

enum ErrorMessage {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

const GraphQLErrorMessage = {
  ...ApolloServerErrorCode,
  ...ErrorMessage,
};

class UnAuthenticated extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = GraphQLErrorMessage.UNAUTHENTICATED;
    this.extensions = {
      code: GraphQLErrorMessage.UNAUTHENTICATED,
      http: {
        status: 401,
      },
    };
  }
}

class UnAuthorized extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'UNAUTHORIZED';
    this.extensions = {
      code: ERROR_MESSAGES.UNAUTHORIZED,
      http: {
        status: 403,
      },
    };
  }
}

class NotFound extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'NOT_FOUND';
    this.extensions = {
      code: ERROR_MESSAGES.NOT_FOUND,
      http: {
        status: 404,
      },
    };
  }
}

class ServerError extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = GraphQLErrorMessage.INTERNAL_SERVER_ERROR;
    this.extensions = {
      code: GraphQLErrorMessage.INTERNAL_SERVER_ERROR,
      http: {
        status: 500,
      },
    };
  }
}

class BadRequest extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = GraphQLErrorMessage.BAD_REQUEST;
    this.extensions = {
      code: GraphQLErrorMessage.BAD_REQUEST,
      http: {
        status: 400,
      },
    };
  }
}

class CONFLICT extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'CONFLICT';
    this.extensions = {
      code: ERROR_MESSAGES.CONFLICT,
      http: {
        status: 409,
      },
    };
  }
}

class UNPROCESSABLE_ENTITY extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'UNPROCESSABLE_ENTITY';
    this.extensions = {
      code: ERROR_MESSAGES.UNPROCESSABLE_ENTITY,
      http: {
        status: 422,
      },
    };
  }
}

export {
  UnAuthenticated,
  UnAuthorized,
  NotFound,
  ServerError,
  BadRequest,
  CONFLICT,
  UNPROCESSABLE_ENTITY,
};
