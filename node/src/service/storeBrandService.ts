import _ from 'lodash'
import { mysql } from '@/lib/mysql'
import { createLoggerByFilename } from '@/lib/logger'
import { getPagination, type PageConnection } from '@/lib/pagination'
import { StoreBrand } from '@/entity'

const logger = createLoggerByFilename(__filename)

export class StoreBrandService {
  async getStoreBrands (trace: Record<string, any>): Promise<PageConnection<StoreBrand>> {
    logger({ fn: 'StoreBrand.getStoreBrands', trace })

    return getPagination({
      size: 10,
      cursorOrder: { key: 'id', order: 'DESC' },
      repo: mysql.getRepository(StoreBrand),
    })
  }
}

export const storeBrandService = new StoreBrandService()
