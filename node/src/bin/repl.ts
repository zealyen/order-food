// must import first
import 'module-alias/register'
import 'reflect-metadata'
import { getenv } from '@/lib/dotenv'

import _ from 'lodash'
import { createLoggerByFilename } from '@/lib/logger'
import Repl from 'repl'

const logger = createLoggerByFilename(__filename)

;(async () => {
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
//   logger('Received "exit" event from repl')
//   await Promise.all([closeMysql(), closeRedis()])
//     .catch(err => { throw _.set(new Error('failed to close mysql and redis'), 'originalError', err) })
})().catch(logger)
