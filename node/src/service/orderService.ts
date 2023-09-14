import _ from 'lodash'
import { mysql } from '@/lib/mysql'
import { redis } from '@/lib/redis'
import { createLoggerByFilename } from '@/lib/logger'
import { start as startWorker } from '@/service/worker'
import { Order } from '@/entity'

const logger = createLoggerByFilename(__filename)

const ADVANCE_ORDER_NUMBERS = 'AdvanceOrderNumbers'
const CHECK_NOT_ENOUGH_ORDERS = 'CheckNotEnoughOrders'
const ADVANCE_THRESHOLD = 5
const EXTEND_AMOUNT = 10

export class OrderService {
  async createOrder (): Promise<void> {

  }

  async CheckNotEnoughOrders (): Promise<void> {
    logger({ fn: 'OrderService.CheckNotEnoughOrders' })

    try {
      const oldAdvOrderNumbers = _.toArray(await redis.hgetall(ADVANCE_ORDER_NUMBERS))

      if (oldAdvOrderNumbers.length < ADVANCE_THRESHOLD) {
        const newAdvOrderNumbers = _.times(EXTEND_AMOUNT, () => `DEV${_.random(1000000, 9999999)}`)
        await redis.hmset(ADVANCE_ORDER_NUMBERS, _.flatMap([...oldAdvOrderNumbers, ...newAdvOrderNumbers], r => [r, r]))

        const orders = _.map(newAdvOrderNumbers, oNum => _.merge(new Order(), { orderNumber: oNum }))
        await mysql.getRepository(Order).save(orders)
      }
    } catch (error) {
      throw _.merge(error, { fn: 'OrderService.CheckNotEnoughOrders' })
    }
  }

  async registerQueueFuncs (): Promise<void> {
    const { cron, delay } = await startWorker()

    // 每 10 分鐘檢查一次
    await cron.queue.add(CHECK_NOT_ENOUGH_ORDERS, {}, { jobId: CHECK_NOT_ENOUGH_ORDERS, repeat: { pattern: '0 */10 * * * *' } })

    cron.handlers.set(CHECK_NOT_ENOUGH_ORDERS, async (job) => {
      await this.CheckNotEnoughOrders()
    })

    delay.handlers.set(CHECK_NOT_ENOUGH_ORDERS, async (job) => {
      await this.CheckNotEnoughOrders()
    })
  }
}

export const orderService = new OrderService()
