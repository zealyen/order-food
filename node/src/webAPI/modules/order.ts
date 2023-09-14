import _ from 'lodash'
import { orderService } from '@/service/orderService'
import { type Order } from '@/entity'
import * as wkx from 'wkx'
import type WebAPIContext from '@/webAPI/context'

export const typeDefs = `#graphql
    enum OrderState {
        QUEUE
        IN_PROGRESS
        COMPLETED
        CANCELED
    }

    type OrderDetail {
        productName: String!
        quantity: Int!
        price: Int!
    }

    type Order {
        id: ID!
        orderNumber: String!
        state: OrderState!
        restaurant: Restaurant!
        totalPrice: Int!
        userName: String!
        userPhone: String!
        userGeolocation: Geolocation!
        deliveryName: String!
        deliveryPhone: String!
        details: [OrderDetail!]!
    }

    extend type Query {
        OrderQuery: OrderQuery!
    }

    type OrderQuery {
        order(orderNumber: String!): Order!
    }
`

export const resolvers = {
  Query: {
    OrderQuery: () => ({}),
  },
  OrderQuery: {
    order: async (parent, { orderNumber }: { orderNumber: string }, context) => {
      return await orderService.getOrder(orderNumber, { reqId: context.reqId })
    },
  },
  Order: {
    restaurant: async (parent: Order, args, context: WebAPIContext) => {
      return await context.dataSources.dsMysql.getRestaurantById(parent.restaurantId)
    },
    userGeolocation: (parent: Order, args) => _.pick(wkx.Geometry.parse(parent.userGeolocation), ['x', 'y']),
  },
}
