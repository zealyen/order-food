import _ from 'lodash'
import { restaurantService } from '@/service/restaurantService'
import * as wkx from 'wkx'

export const typeDefs = `#graphql
    type Restaurant {
        id: ID!
        name: String!
        geolocation: Geolocation!
    }

    type Geolocation {
        x: Float!
        y: Float!
    }

    type RestaurantEdge {
        cursor: ID!
        node: Restaurant!
    }

    type RestaurantConnection {
        edges: [RestaurantEdge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    extend type Query {
        RestaurantQuery: RestaurantQuery!
    }

    type RestaurantQuery {
        restaurants: RestaurantConnection
    }
`

export const resolvers = {
  Query: {
    RestaurantQuery: () => ({}),
  },
  RestaurantQuery: {
    restaurants: async (parent, args, context) => {
      return await restaurantService.getRestaurants({ reqId: context.reqId })
    },
  },
  Restaurant: {
    geolocation: (parent) => _.pick(wkx.Geometry.parse(parent.geolocation), ['x', 'y']),
  },
}
