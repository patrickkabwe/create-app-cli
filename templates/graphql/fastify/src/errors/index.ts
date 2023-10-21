import { ApolloServerErrorCode } from '@apollo/server/errors'
// import { GraphQLError } from 'graphql'
import { ERROR_MESSAGES } from './errorMessages'

enum ErrorMessage {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

const GraphQLErrorMessage = {
  ...ApolloServerErrorCode,
  ...ErrorMessage,
}

export interface GraphQLErrorExtensions {
  code: string
  http: {
    status: number
  }
}

class BaseGraphQLError extends Error {
  extensions: GraphQLErrorExtensions

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = code
    this.extensions = {
      code,
      http: {
        status,
      },
    }
  }
}

class UnAuthenticated extends BaseGraphQLError {
  constructor(message: string) {
    super(message, GraphQLErrorMessage.UNAUTHENTICATED, 401)
    this.name = GraphQLErrorMessage.UNAUTHENTICATED
  }
}

class UnAuthorized extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ERROR_MESSAGES.UNAUTHORIZED, 403)
    this.name = ERROR_MESSAGES.UNAUTHORIZED
  }
}

class NotFound extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ERROR_MESSAGES.NOT_FOUND, 404)
    this.name = ERROR_MESSAGES.NOT_FOUND
  }
}

class ServerError extends BaseGraphQLError {
  constructor() {
    super(
      'Something went wrong',
      GraphQLErrorMessage.INTERNAL_SERVER_ERROR,
      500,
    )
    this.name = GraphQLErrorMessage.INTERNAL_SERVER_ERROR
  }
}

class BadRequest extends BaseGraphQLError {
  constructor(message: string) {
    super(message, GraphQLErrorMessage.BAD_REQUEST, 400)
    this.name = GraphQLErrorMessage.BAD_REQUEST
  }
}

class CONFLICT extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ERROR_MESSAGES.CONFLICT, 409)
    this.name = ERROR_MESSAGES.CONFLICT
  }
}

class UNPROCESSABLE_ENTITY extends BaseGraphQLError {
  constructor(message: string) {
    super(message, ERROR_MESSAGES.UNPROCESSABLE_ENTITY, 422)
    this.name = 'UNPROCESSABLE_ENTITY'
  }
}

export {
  BadRequest,
  CONFLICT,
  NotFound,
  ServerError,
  UNPROCESSABLE_ENTITY,
  UnAuthenticated,
  UnAuthorized,
}
