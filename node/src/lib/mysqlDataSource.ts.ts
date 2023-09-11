import _ from 'lodash'
import { GraphQLError } from 'graphql'
import { In, type Repository } from 'typeorm'
import { mysql } from './mysql'
import { Order } from '@/entity'
import DataLoader from 'dataloader'

export class MysqlDataSource {
  async getOrders (): Promise<any[]> {
    const orders = await mysql.getRepository(Order).find()
    return orders
  }
}
