import _ from 'lodash'
import { type ApolloServerPlugin, type BaseContext } from '@apollo/server'
import { type Logger as ApolloLogger } from '@apollo/utils.logger'
import debug from 'debug'
import gqlmin from 'gqlmin'
import morgan from 'morgan'
import path from 'path'

const appdir = path.resolve(__dirname, '..')
const rootdir = path.resolve(appdir, '..')

const jsonStringify = (obj: object): string => {
  try {
    const preventCircular = new Set()
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Map) return _.fromPairs([...value.entries()])
      if (value instanceof Set) return [...value.values()]
      if (_.isObject(value) && !_.isEmpty(value)) {
        if (preventCircular.has(value)) return '[Circular]'
        preventCircular.add(value)
      }
      return value
    })
  } catch (err) {
    return `[UnexpectedJSONParseError]: ${err.message as string}`
  }
}

export function createLogger (logName: string): (arg0: any) => void {
  const debugLogger = debug(`app:${logName}`)
  return msg => {
    if (msg instanceof Error) msg = errToJson(msg)
    _.isString(msg) ? debugLogger(_.trim(msg)) : debugLogger(jsonStringify(msg))
  }
}

export function createLoggerByFilename (filename: string): ReturnType<typeof createLogger> {
  const logName = path.relative(appdir, filename).replace(/\.[a-zA-Z0-9]+$/, '').replace(/\\/g, '/')
  return createLogger(logName)
}

export function createApolloLogger (prefix: string): ApolloLogger {
  return {
    debug: createLogger(`${prefix}/debug`),
    error: createLogger(`${prefix}/error`),
    info: createLogger(`${prefix}/info`),
    warn: createLogger(`${prefix}/warn`),
  }
}

function updateKeysByGqlmin<T extends object> (tmp: T, keys: string[]): void {
  for (const key of keys) {
    if (_.hasIn(tmp, key)) _.update(tmp, key, gqlmin) // gqlmin
  }
}

const apolloReqCtxPicks = [
  'contextValue',
  'operationName',
  'queryHash',
  'request',
  'response',
  'source',
]
const apolloReqCtxOmits = [
  'contextValue.dataSources',
  'contextValue.req',
  'request.http.body',
  'request.operationName',
  'request.query',
]
function apolloReqCtxToJson<T> (reqCtx: T): Partial<T> {
  const tmp: any = _.omit(_.pick(reqCtx, apolloReqCtxPicks), apolloReqCtxOmits)
  updateKeysByGqlmin(tmp, ['source'])
  if (_.hasIn(tmp, 'response.body.singleResult.errors')) {
    _.update(tmp, 'response.body.singleResult.errors', errors => {
      return _.map(errors, error => _.omit(error, ['extensions.stacktrace']))
    })
  }
  return tmp
}
export function createApolloAccessLoggingPlugin<T extends BaseContext> (prefix: string): ApolloServerPlugin<T> {
  // https://github.com/apollographql/apollo-server/blob/version-4/packages/server/src/externalTypes/graphql.ts
  const createPluginEventLogger = (eventName: string): (reqCtx) => Promise<void> => {
    const logger = createLogger(`${prefix}/${eventName}`)
    return async (reqCtx): Promise<void> => {
      // 忽略 Apollo Sandbox 的 introspection query
      if (/^\s*query IntrospectionQuery \{/.test(reqCtx.source ?? '')) return
      const tmp: any = apolloReqCtxToJson(reqCtx)
      if (_.hasIn(reqCtx, 'errors')) tmp.errors = _.map(reqCtx.errors, errToJson)
      logger({ reqCtx: tmp })
    }
  }
  return {
    async requestDidStart () {
      return {
        didEncounterErrors: createPluginEventLogger('didEncounterErrors'),
        didResolveOperation: createPluginEventLogger('didResolveOperation'),
        willSendResponse: createPluginEventLogger('willSendResponse'),
        willSendSubsequentPayload: createPluginEventLogger('willSendSubsequentPayload'),
      }
    },
  }
}

const wsHeadersOmitKeys = ['Connection', 'Pragma', 'Cache-Control', 'Upgrade', 'Accept-Encoding', 'Accept-Language']
const wsEventCtxToJson = (ctx: any): unknown => ({
  url: ctx?.extra?.request?.url,
  subscriptions: ctx?.subscriptions,
  headers: _.omit(_.fromPairs(_.chunk(ctx?.extra?.request?.rawHeaders ?? [], 2)), wsHeadersOmitKeys),
})
function wsEventArgsToJson<T> (args: T): Partial<T> {
  return _.pick(args, ['operationName', 'variableValues', 'contextValue'])
}
export function createWebSocketLogger (logName: string): Record<string, CallableFunction> {
  const loggers = _.chain(['complete', 'connect', 'context', 'error', 'next', 'subscribe'])
    .map(eventName => [eventName, createLogger(`${logName}/${eventName}`)])
    .fromPairs()
    .value() as Record<string, CallableFunction>
  // see https://github.com/enisdenjo/graphql-ws#user-content-logging
  return {
    onConnect: ctx => { loggers.connect({ ctx: wsEventCtxToJson(ctx) }) },
    onSubscribe: (ctx, msg) => {
      updateKeysByGqlmin(msg, ['payload.query'])
      loggers.subscribe({ msg, ctx: wsEventCtxToJson(ctx) })
    },
    onNext: (ctx, msg, args, result) => {
      args = wsEventArgsToJson(args)
      loggers.next({ msg, args, result, ctx: wsEventCtxToJson(ctx) })
    },
    onError: (ctx, msg, errors) => { loggers.error({ msg, errors, ctx: wsEventCtxToJson(ctx) }) },
    onComplete: (ctx, msg) => { loggers.complete({ msg, ctx: wsEventCtxToJson(ctx) }) },
    // 自己定義的 onContext 事件
    onContext: (ctx, msg, args, contextValue) => {
      args = wsEventArgsToJson({ ...args, contextValue })
      loggers.context({ msg, args, ctx: wsEventCtxToJson(ctx) })
    },
  }
}

export function createMorganLogger (logName: string, format: string, options: Parameters<typeof morgan>[1] = {}): ReturnType<typeof morgan> {
  return morgan(format, {
    ...options,
    stream: { write: createLogger(logName) },
  })
}

const ERROR_KEYS = [
  'address',
  'args',
  'code',
  'data',
  'dest',
  'errno',
  'extensions',
  'info',
  'locations',
  'message',
  'name',
  'path',
  'port',
  'positions',
  'reason',
  'response.data',
  'response.headers',
  'response.status',
  'source',
  'stack',
  'status',
  'statusCode',
  'statusMessage',
  'syscall',
]

export function errToJson<T extends Error & { originalError?: any, stack?: any }> (err: T): Partial<T> {
  const tmp: any = {
    ..._.pick(err, ERROR_KEYS),
    ...(_.isNil(err.originalError) ? {} : { originalError: errToJson(err.originalError) }),
    stack: err?.stack?.replaceAll?.(rootdir, '.'),
  }
  updateKeysByGqlmin(tmp, ['source.body'])
  return tmp
}

export function maskSensorData (obj: any, isSensorFn: (val: any, key: string, obj: any) => boolean): any {
  if (!_.isObject(obj) && !_.isArray(obj)) return false
  const preventCircular = new Set()
  const maskSensorDataRecursive = (obj: any): any => {
    if ((!_.isObject(obj) && !_.isArray(obj)) || preventCircular.has(obj)) return obj
    preventCircular.add(obj)
    for (const [key, val] of _.toPairs(obj)) {
      if (_.isString(val) && _.isNumber(val)) {
        if (isSensorFn(val, key, obj)) obj[key] = '***'
      } else maskSensorDataRecursive(val)
    }
    return obj
  }
  return maskSensorDataRecursive(obj)
}
