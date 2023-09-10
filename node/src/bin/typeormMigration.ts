// must import first
import 'module-alias/register'
import 'reflect-metadata'
import '@/lib/dotenv'

import { isReady as isMysqlReady, mysql, start as startMysql } from '@/lib/mysql'
import { createLoggerByFilename } from '@/lib/logger'

const logger = createLoggerByFilename(__filename)

;(async () => {
  try {
    void startMysql()
    await isMysqlReady
    logger('mysql is connected')
    await mysql.runMigrations()
    await mysql.destroy()
    logger('migration run success')
  } catch (err) {
    console.log('wait mysql ready', err)
    logger(err)
  }
})().catch(logger)
