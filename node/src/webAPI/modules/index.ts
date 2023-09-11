export const typeDefs = `#graphql
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export const resolvers = {
  Query: {
    _: () => true,
  },

  Subscription: {
    _: {
      async * subscribe () {
        yield { _: true }
      },
    },
  },
}
