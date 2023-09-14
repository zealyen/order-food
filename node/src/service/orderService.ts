import _ from 'lodash'
import { mysql } from '@/lib/mysql'
import { redis } from '@/lib/redis'
import { createLoggerByFilename } from '@/lib/logger'
import { start as startWorker } from '@/service/worker'
import { Menu, Order } from '@/entity'
import { OrderStatus } from '@/enum/order'
import { In } from 'typeorm'
import { getPagination, type PageConnection } from '@/lib/pagination'

const logger = createLoggerByFilename(__filename)

const ADVANCE_ORDER_NUMBERS = 'AdvanceOrderNumbers'
const CHECK_NOT_ENOUGH_ORDERS = 'CheckNotEnoughOrders'
const ADVANCE_THRESHOLD = 5
const EXTEND_AMOUNT = 10

export type CreateOrderInput = Pick<Order, 'userName' | 'userPhone'> & { x: number, y: number, shoppingCar: Array<{ id: number, quantity: number }> }
export type TakeOrderInput = Pick<Order, 'orderNumber' | 'deliveryName' | 'deliveryPhone'> & { x: number, y: number }
export type ReportOrderInput = Pick<Order, 'orderNumber' | 'state'> & { x: number, y: number }

export class OrderService {
  async getOrder (orderNumber: string, trace: Record<string, any>): Promise<Order> {
    logger({ fn: 'OrderService.getOrder', orderNumber, trace })

    try {
      return await mysql.getRepository(Order).findOneOrFail({ where: { orderNumber } })
    } catch (error) {
      throw _.merge(error, { fn: 'OrderService.getOrder', orderNumber, trace })
    }
  }

  async getOrders (trace: Record<string, any>): Promise<PageConnection<Order>> {
    logger({ fn: 'OrderService.getOrders', trace })

    return getPagination({
      where: { state: OrderStatus.IN_PROGRESS },
      size: 10,
      cursorOrder: { key: 'id', order: 'DESC' },
      repo: mysql.getRepository(Order),
    })
  }

  async createOrder (input: CreateOrderInput, trace: Record<string, any>): Promise<Order | undefined> {
    logger({ fn: 'OrderService.createOrder', input })

    try {
      const menus = await mysql.getRepository(Menu).findBy({ id: In(_.map(input.shoppingCar, 'id')) })

      if (_.isEmpty(menus)) throw new Error('not found menu')

      const details = _.map(menus, menu => {
        const shop = _.find(input.shoppingCar, { id: menu.id })
        return {
          productName: menu.productName,
          quantity: shop?.quantity,
          price: menu.price * _.toSafeInteger(shop?.quantity),
        }
      })

      const sql = `
        select id,name,
              st_distance_sphere(geolocation, st_geomfromtext('Point(? ?)', 4326)) as distance
        from Restaurants
        order by distance asc
        limit 1;
      `
      const shortestRestaurant = (await mysql.query(sql, [input.x, input.y]))[0]

      if (_.isNil(shortestRestaurant)) throw new Error('not found shortest restaurant')

      const advanceOrderNumbers = _.toArray(await redis.hgetall(ADVANCE_ORDER_NUMBERS))

      let count = 1
      let updated: Order | undefined

      updated = await (async () => {
        while (count < 10) {
          count++
          const orderNumber = advanceOrderNumbers.pop()

          try {
            if (_.isNil(orderNumber)) throw new Error('not found order number')

            const updateOrder = _.merge(new Order(), {
              orderNumber,
              state: OrderStatus.IN_PROGRESS,
              restaurantId: shortestRestaurant.id,
              totalPrice: _.sumBy(details, 'price'),
              userPhone: input.userPhone,
              userName: input.userName,
              userGeolocation: `POINT(${input.x} ${input.y})`,
              details,
            })

            updated = await mysql.getRepository(Order).save(updateOrder)

            if (!_.isNil(updated) || !_.isNil(_.pick(updated, 'id'))) {
              await redis.hdel(ADVANCE_ORDER_NUMBERS, orderNumber)
              await redis.hset('Orders', orderNumber, JSON.stringify(updated))

              return updated
            }
          } catch (error) {
            logger({ fn: 'OrderService.createOrder while', orderNumber, error })
          }
        }
      })()

      if (count >= 10) throw new Error('create order failed')

      logger({ fn: 'updated order', input, updated })

      return updated
    } catch (error) {
      throw _.merge(error, { fn: 'OrderService.createOrder', input })
    }
  }

  async takeOrder (input: TakeOrderInput, trace: Record<string, any>): Promise<Order> {
    logger({ fn: 'OrderService.takeOrder', input, trace })

    try {
      const orderRepo = mysql.getRepository(Order)
      const order = await orderRepo.findOneOrFail({ where: { orderNumber: input.orderNumber, state: OrderStatus.IN_PROGRESS } })
      const updateData = { state: OrderStatus.TOOK, deliveryName: input.deliveryName, deliveryPhone: input.deliveryPhone }

      const updated = await orderRepo.createQueryBuilder()
        .update(Order)
        .set(updateData)
        .where({ orderNumber: order.orderNumber, state: OrderStatus.IN_PROGRESS })
        .execute()

      if (updated.affected === 0) throw new Error('take order failed')

      const newOrder = _.merge(order, updateData, { deliveryGeolocation: `POINT(${input.x} ${input.y})` })

      await redis.hset('Orders', newOrder.orderNumber, JSON.stringify(newOrder))
      console.log('newOrder', await redis.hget('Orders', newOrder.orderNumber))

      return newOrder
    } catch (error) {
      throw _.merge(error, { fn: 'OrderService.takeOrder', input, trace })
    }
  }

  async reportOrder (input: ReportOrderInput, trace: Record<string, any>): Promise<Order> {
    logger({ fn: 'OrderService.reportOrder', input, trace })

    try {
      const order = await redis.hget('Orders', input.orderNumber)

      if (_.isNil(order)) throw new Error('not found order')

      const updateData = { deliveryGeolocation: `POINT(${input.x} ${input.y})`, state: input.state }
      const newOrder = _.merge(JSON.parse(order), updateData)

      // 表示訂單狀態可能變成 IN_PROGRESS or COMPLETE
      if (_.includes([OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED], input.state)) {
        const orderRepo = mysql.getRepository(Order)
        await orderRepo.createQueryBuilder()
          .update(Order)
          .set({ state: input.state })
          .where({ orderNumber: input.orderNumber, state: OrderStatus.TOOK })
          .execute()
      }

      await redis.hset('Orders', input.orderNumber, JSON.stringify(newOrder))

      return newOrder
    } catch (error) {
      throw _.merge(error, { fn: 'OrderService.reportGeolocation', input, trace })
    }
  }

  async registerQueueFuncs (): Promise<void> {
    const { cron } = await startWorker()

    // 每 1 分鐘檢查一次
    await cron.queue.add(CHECK_NOT_ENOUGH_ORDERS, {}, { jobId: CHECK_NOT_ENOUGH_ORDERS, repeat: { pattern: '0 */1 * * * *' } })

    // 檢查是否有足夠的訂單數量，沒有的話就新增一些
    cron.handlers.set(CHECK_NOT_ENOUGH_ORDERS, async (job) => {
      try {
        const oldAdvOrderNumbers = _.toArray(await redis.hgetall(ADVANCE_ORDER_NUMBERS))

        if (oldAdvOrderNumbers.length < ADVANCE_THRESHOLD) {
          const newAdvOrderNumbers = _.times(EXTEND_AMOUNT, () => `DEV${_.random(1000000, 9999999)}`)
          await redis.hmset(ADVANCE_ORDER_NUMBERS, _.flatMap([...oldAdvOrderNumbers, ...newAdvOrderNumbers], r => [r, r]))

          const orders = _.map(newAdvOrderNumbers, oNum => _.merge(new Order(), { orderNumber: oNum }))
          await mysql.getRepository(Order).save(orders)

          logger({ fn: 'OrderService.CheckNotEnoughOrders', orderNumbers: [...oldAdvOrderNumbers, ...newAdvOrderNumbers] })
        }
      } catch (error) {
        throw _.merge(error, { fn: 'OrderService.CheckNotEnoughOrders' })
      }
    })
  }
}

export const orderService = new OrderService()
