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
    await mysql.undoLastMigration()
    await mysql.destroy()
    logger('migration reverted')
  } catch (err) {
    logger(err)
  }
})().catch(logger)
