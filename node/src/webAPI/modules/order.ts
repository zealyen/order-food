import _ from 'lodash'
import { orderService } from '@/service/orderService'
import { type Order } from '@/entity'
import * as wkx from 'wkx'
import type WebAPIContext from '@/webAPI/context'

export const typeDefs = `#graphql
    enum OrderState {
      """
      - 空白訂單狀態
      """
      QUEUE
      """
      - 訂單成立狀態
      """
      IN_PROGRESS
      """
      - 訂單已被接單狀態
      """
      TOOK
      """
      - 訂單已完成狀態
      """
      COMPLETED
      """
      - 訂單已取消狀態
      """
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
      deliveryName: String
      deliveryPhone: String
      details: [OrderDetail!]!
      deliveryGeolocation: Geolocation
    }

    type OrderEdge {
      cursor: ID!
      node: Order!
    }

    type OrderConnection {
      edges: [OrderEdge!]!
      pageInfo: PageInfo!
      totalCount: Int!
    }

    input OrderDetailInput {
      """
      - menu id
      """
      id: Int!
      quantity: Int!
    }

    input CreateOrderInput {
      userName: String!
      userPhone: String!
      x: Float!
      y: Float!
      shoppingCar: [OrderDetailInput!]!
    }

    input TakeOrderInput {
      orderNumber: String!
      deliveryName: String!
      deliveryPhone: String!
      x: Float!
      y: Float!
    }

    input ReportOrderInput {
      orderNumber: String!
      x: Float!
      y: Float!
      state: OrderState!
    }

    extend type Query {
      OrderQuery: OrderQuery!
    }

    extend type Mutation {
      OrderMutation: OrderMutation!
    }

    type OrderMutation {
      """
      - 新增訂單
      """
      createOrder(input: CreateOrderInput!): Order!
      """
      - 接單
      """
      takeOrder(input: TakeOrderInput!): Order!
      """
      - 回報訂單狀態，如：已取餐、已送達，或是取消接單
      - 同時回報 GPS 座標
      """
      reportOrder(input: ReportOrderInput!): Order!
    }

    type OrderQuery {
      """
      - 查詢單一訂單
      """
      order(orderNumber: String!): Order!
      """
      - 查詢訂單列表，只限於 state 為 IN_PROGRESS 的訂單
      """
      orders: OrderConnection!
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
    orders: async (parent, args, context: WebAPIContext) => {
      return await orderService.getOrders({ reqId: context.reqId })
    },
  },
  Order: {
    restaurant: async (parent: Order, args, context: WebAPIContext) => {
      return await context.dataSources.dsMysql.getRestaurantById(parent.restaurantId)
    },
    userGeolocation: (parent: Order, args) => _.pick(wkx.Geometry.parse(parent.userGeolocation), ['x', 'y']),
    deliveryGeolocation: (parent, args) => _.pick(wkx.Geometry.parse(parent.deliveryGeolocation), ['x', 'y']),
  },
  OrderMutation: {
    createOrder: async (parent, args, context: WebAPIContext) => {
      return await orderService.createOrder(args.input, { reqId: context.reqId })
    },
    takeOrder: async (parent, args, context: WebAPIContext) => {
      return await orderService.takeOrder(args.input, { reqId: context.reqId })
    },
    reportOrder: async (parent, args, context: WebAPIContext) => {
      return await orderService.reportOrder(args.input, { reqId: context.reqId })
    },
  },
}
