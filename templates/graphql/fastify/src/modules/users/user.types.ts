export const userTypeDefs = `#graphql
  type User {
    id: String
    name: String!
    email: String
    lastLogin: String
  }
  input UserPayload {
    name: String
    email: String
    password: String
    avatar: String
  }

  type Query {
    user(id: ID): User
    me: User
  }

  type Mutation {
    updateUser(input: UserPayload!, id: String!): Ok
    userInvite(input: UserPayload): User
  }

  type Subscription {
    userInvite: Ok
  }
`
