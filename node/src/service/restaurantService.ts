import _ from 'lodash'
import { mysql } from '@/lib/mysql'
import { createLoggerByFilename } from '@/lib/logger'
import { getPagination, type PageConnection } from '@/lib/pagination'
import { Restaurant } from '@/entity'

const logger = createLoggerByFilename(__filename)

export class RestaurantService {
  async getRestaurants (trace: Record<string, any>): Promise<PageConnection<Restaurant>> {
    logger({ fn: 'RestaurantService.getRestaurants', trace })

    return getPagination({
      size: 10,
      cursorOrder: { key: 'id', order: 'DESC' },
      repo: mysql.getRepository(Restaurant),
    })
  }
}

export const restaurantService = new RestaurantService()
