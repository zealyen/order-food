import _ from 'lodash'
import { addMocksToSchema } from '@graphql-tools/mock'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { createApolloAccessLoggingPlugin, createApolloLogger, createLoggerByFilename, createWebSocketLogger } from '@/lib/logger'
import { expressMiddleware } from '@apollo/server/express4'
import { getSiteurl } from '@/lib/dotenv'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { print } from 'graphql'
import { randomBase62 } from '@/lib/helper'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import * as moduleIndex from '@/webAPI/modules/index'
import * as pageInfo from '@/lib/pagination'
import * as restaurant from '@/webAPI/modules/restaurant'
import bodyParser from 'body-parser'
import cors from 'cors'
import type WebAPIContext from '@/webAPI/context'

const logger = createLoggerByFilename(__filename)

const modules = [
  moduleIndex,
  pageInfo,
  restaurant,
]

let server: ApolloServer<WebAPIContext>

export default async function init ({ app, httpServer, wsServers }): Promise<void> {
  try {
    const httpPath = '/webAPI/v1'
    let schema = makeExecutableSchema({
      typeDefs: _.filter(_.flatMap(modules, 'typeDefs')),
      resolvers: _.filter(_.flatMap(modules, 'resolvers')),
    })

    const mocks: Parameters<typeof addMocksToSchema>[0]['mocks'] = _.extend({}, ..._.filter(_.flatMap(modules, 'mocks')))
    schema = addMocksToSchema({ mocks, preserveResolvers: true, schema })

    const wsServer = new WebSocketServer({ noServer: true })
    const wsLoggers = createWebSocketLogger(`${httpPath.slice(1)}/ws`)
    const serverCleanup = useServer({
      schema,
      async context (ctx, msg, args): Promise<WebAPIContext> { // context for ws
        const reqId = randomBase62(24)
        const contextValue = { reqId, dataSources: { dsMysql: null } }
        wsLoggers.onContext(ctx, msg, args, contextValue)
        return contextValue
      },
      ...wsLoggers,
    }, wsServer)
    wsServers.set(httpPath, wsServer)

    server = new ApolloServer<WebAPIContext>({
      schema,
      logger: createApolloLogger(httpPath.slice(1)),
      introspection: false,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),

        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart () {
            return {
              async drainServer () {
                await serverCleanup.dispose()
              },
            }
          },
        },

        createApolloAccessLoggingPlugin(httpPath.slice(1)),
      ],
    })

    await server.start()

    app.use(httpPath,
      cors(),
      bodyParser.json(),
      expressMiddleware(server, {
        async context ({ req }): Promise<WebAPIContext> {
          const reqId = randomBase62(24)
          const contextValue = { reqId, req, dataSources: { dsMysql: null } }
          return contextValue
        },
      })
    )

    logger(`GraphQL Sandbox: ${getSiteurl(httpPath)}`)
  } catch (err) {
    logger(err)
  }
}

export async function close (): Promise<void> {
  await server?.stop()
}

export function printTypeDefs (): string {
  return print(mergeTypeDefs(_.flatMap(modules, 'typeDefs')))
}
