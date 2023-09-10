import _ from 'lodash'
import { getenv } from '@/lib/dotenv'
import Redis from 'ioredis'
import resolvable from '@josephg/resolvable'

const redisPassword = getenv('REDIS_PASSWORD', '')

const redisConfig = {
  host: getenv('REDIS_HOST', 'localhost'),
  port: _.toInteger(getenv('REDIS_PORT', 6379)),
  ...(redisPassword.length > 0 ? { password: redisPassword } : {}), // AUTH
  ...(getenv('REDIS_TLS', 'false') === 'true' ? { tls: {} } : {}), // TLS
  lazyConnect: true,
}

export const isReady = resolvable<any>()

export const redis = new Redis({
  ...redisConfig,
  db: _.toInteger(getenv('REDIS_DB', 0)),
})

export const redisBullmq = new Redis({
  ...redisConfig,
  // avoid waring message: DEPRECATION WARNING! Your redis options maxRetriesPerRequest must be null
  maxRetriesPerRequest: null,
  db: _.toInteger(getenv('REDIS_DB_BULLMQ', 1)),
})

export const redisGraphql = new Redis({
  ...redisConfig,
  db: _.toInteger(getenv('REDIS_DB_GRAPHQL', 2)),
})

export async function close (): Promise<void> {
  await Promise.all([redis.quit(), redisBullmq.quit(), redisGraphql.quit()])
}

export async function start (): Promise<void> {
  try {
    void Promise.all([redis.connect(), redisBullmq.connect(), redisGraphql.connect()])
    await Promise.all(_.map(
      [redis, redisBullmq, redisGraphql],
      async r => await new Promise((resolve, reject) => r.on('connect', resolve).on('error', reject)))
    )
    isReady.resolve(null)
  } catch (err) {
    isReady.reject(err)
  }
}
