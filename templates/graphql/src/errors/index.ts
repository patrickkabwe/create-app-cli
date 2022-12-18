// @ts-nocheck
import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

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
    };
  }
}

class UnAuthorized extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'UNAUTHORIZED';
  }
}

class FORBIDDEN extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'FORBIDDEN';
  }
}

class NotFound extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'NOT_FOUND';
  }
}

class ServerError extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = GraphQLErrorMessage.INTERNAL_SERVER_ERROR;
    this.extensions = {
      code: GraphQLErrorMessage.INTERNAL_SERVER_ERROR,
    };
  }
}

class BadRequest extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = GraphQLErrorMessage.BAD_REQUEST;
    this.extensions = {
      code: GraphQLErrorMessage.BAD_REQUEST,
    };
  }
}

class CONFLICT extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'CONFLICT';
  }
}

class UNPROCESSABLE_ENTITY extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'UNPROCESSABLE_ENTITY';
  }
}

class INVALID_CREDENTIALS extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'INVALID_CREDENTIALS';
  }
}

export {
  UnAuthenticated,
  UnAuthorized,
  FORBIDDEN,
  NotFound,
  ServerError,
  BadRequest,
  CONFLICT,
  UNPROCESSABLE_ENTITY,
  INVALID_CREDENTIALS,
};
