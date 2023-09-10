import _ from 'lodash'
import { DataSource } from 'typeorm'
import { getenv, getenvJson5, isDevelopment } from '@/lib/dotenv'
import resolvable from '@josephg/resolvable'

export const isReady = resolvable<any>()

export const mysql = new DataSource({
  database: getenv('MYSQL_DATABASE', 'orderDocker'),
  entities: ['dist/entity/**/*.js'],
  host: getenv('MYSQL_HOST', 'localhost'),
  migrations: ['dist/migration/**/*.js'],
  migrationsRun: true,
  password: getenv('MYSQL_PASSWORD', 'docker'),
  port: _.toInteger(getenv('MYSQL_PORT', 3306)),
  type: 'mysql',
  username: getenv('MYSQL_USER', 'root'),
  charset: 'utf8mb4_0900_ai_ci',
  timezone: getenv('MYSQL_TIMEZONE', 'Z'),

  // 可透過修改 `MYSQL_LOGGING=true` 來開啟 mysql 的 log, see https://typeorm.io/logging#changing-default-logger
  ...(getenvJson5('MYSQL_LOGGING', false) === false ? {} : {
    logging: true,
    logger: isDevelopment ? 'debug' : 'simple-console',
  }),
})

export async function start (): Promise<void> {
  try {
    await mysql.initialize()
    isReady.resolve(null)
  } catch (err) {
    isReady.reject(_.set(new Error('failed to init mysql'), 'originalError', err))
  }
}

export async function close (): Promise<void> {
  await mysql.destroy()
}
