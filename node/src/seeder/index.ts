import 'module-alias/register'
import 'reflect-metadata'
import '@/lib/dotenv'

import { start as startMysql, close as closeMysql } from '@/lib/mysql'
import seederStoreBrand from './storeBrand'
import seederRestaurant from './restaurant'
import seederMenu from './menu'
import seederOrder from './order'
import { createLoggerByFilename } from '@/lib/logger'

const logger = createLoggerByFilename(__filename)

const seeders = [
  seederStoreBrand,
  seederRestaurant,
  seederMenu,
  seederOrder,
]

;(async () => {
  try {
    await startMysql()
    for (const seeder of seeders) await seeder()
  } catch (error) {
    logger(error)
    throw error
  } finally {
    logger('seeder run end')
    await closeMysql()
  }
})().catch(error => { throw error })
