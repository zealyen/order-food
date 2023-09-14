import { storeBrandService } from '@/service/storeBrandService'
import type WebAPIContext from '@/webAPI/context'

export const typeDefs = `#graphql
    type StoreBrand {
        id: ID!
        name: String!
        restaurants: [Restaurant!]!
    }

    type StoreBrandEdge {
        cursor: ID!
        node: StoreBrand!
    }

    type StoreBrandConnection {
        edges: [StoreBrandEdge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    type StoreBrandQuery {
        storeBrands: StoreBrandConnection!
    }

    extend type Query {
        StoreBrandQuery: StoreBrandQuery!
    } 
`

export const resolvers = {
  Query: {
    StoreBrandQuery: () => ({}),
  },
  StoreBrandQuery: {
    storeBrands: async (parent, args, context) => {
      return await storeBrandService.getStoreBrands({ reqId: context.reqId })
    },
  },
  StoreBrand: {
    restaurants: async (parent, args, context: WebAPIContext) => {
      return await context.dataSources.dsMysql.getRestaurantByStoreBrandId(parent.id)
    },
  },
}
