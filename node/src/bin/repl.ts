
// must import first
import _ from 'lodash'
import 'module-alias/register'
import 'reflect-metadata'
import { createLoggerByFilename } from '@/lib/logger'
import { getenv } from '@/lib/dotenv'
import { isReady as isMysqlReady, close as closeMysql, start as startMysql } from '@/lib/mysql'
import { isReady as isRedisReady, close as closeRedis, start as startRedis } from '@/lib/redis'
import Repl from 'repl'

const logger = createLoggerByFilename(__filename)

;(async () => {
  void startMysql()
  void startRedis()

  await Promise.all([isMysqlReady, isRedisReady])
    .catch(err => { throw _.set(new Error('failed to init mysql and redis'), 'originalError', err) })

  const repl = Repl.start({
    breakEvalOnSigint: true,
    ignoreUndefined: true,
    prompt: `${getenv('NODE_ENV', 'development')}> `,
    useGlobal: true,
  })
  repl.setupHistory?.('.node_repl_history', (err, r) => {
    if (!_.isNil(err)) logger(err)
  })

  _.extend(repl.context, { lodash: _, logger })
  _.extend(repl.context.process.env, {
    DEBUG_COLORS: true,
  })

  await new Promise(resolve => repl.on('exit', resolve))
  logger('Received "exit" event from repl')
  await Promise.all([closeMysql(), closeRedis()])
    .catch(err => { throw _.set(new Error('failed to close mysql and redis'), 'originalError', err) })
})().catch(logger)
