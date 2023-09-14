// must import first
import 'module-alias/register'
import 'reflect-metadata'
import { getPort, getSiteurl, isDevelopment } from '@/lib/dotenv'

import _ from 'lodash'
import { createLoggerByFilename, createMorganLogger } from '@/lib/logger'
import { createServer } from 'http'
import { isReady as isMysqlReady, mysql, start as startMysql, close as closeMysql } from '@/lib/mysql'
import { isReady as isRedisReady, start as startRedis, close as closeRedis } from '@/lib/redis'
import { type WebSocketServer } from 'ws'
import express from 'express'
import webAPI, { close as closeWebAPI } from '@/webAPI/index'
import { start as startWorker, close as closeWorker } from '@/service/worker'

const logger = createLoggerByFilename(__filename)

;(async () => {
  try {
    void startMysql()
    void startRedis()

    await Promise.all([
      isMysqlReady.then(async () => { // Run migrations
        await mysql.runMigrations().catch(err => {
          const tmp = new Error('failed to run mysql migration')
          throw _.set(tmp, 'originalError', err)
        })
      }),
      isRedisReady,
    ])

    await startWorker()

    const app = express()
    const httpServer = createServer(app)
    const wsServers = new Map<string, WebSocketServer>()

    await Promise.all([ // init all graphql servers
      webAPI({ app, httpServer, wsServers }),
    ])

    app.use(createMorganLogger('morgan', isDevelopment ? 'dev' : 'combined'))

    // handle multi websocket server
    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
      if (!wsServers.has(pathname)) return socket.destroy()
      const wsServer = wsServers.get(pathname) as WebSocketServer
      wsServer.handleUpgrade(request, socket, head, (client) => {
        wsServer.emit('connection', client, request)
      })
    })

    await new Promise<void>(resolve => httpServer.listen({ port: getPort() }, resolve))

    async function closeGracefully (signal): Promise<void> {
      try {
        logger('🛑 Closing gracefully...')
        await closeWebAPI()
        await closeWorker()
        await new Promise(resolve => { httpServer.close(resolve) })
        await Promise.all([closeMysql(), closeRedis()])
        process.kill(process.pid, signal)
      } catch (err) {
        logger(err)
      }
    }
    process.once('SIGINT', closeGracefully as (...args: any[]) => void)
    process.once('SIGTERM', closeGracefully as (...args: any[]) => void)
    logger(`🚀 Server ready at ${getSiteurl()}`)
  } catch (err) {
    logger(err)
    process.exit(1)
  }
})().catch(logger)
