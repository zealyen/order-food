import _ from 'lodash'
import { json5parseOrDefault } from '@/lib/helper'
import dotenv from 'dotenv'

dotenv.config()

export function getenv (key: string): string | undefined
export function getenv<T> (key: string, defaultVal: T): string | T

export function getenv (key: string, defaultVal: unknown = undefined): unknown {
  return process.env?.[key] ?? defaultVal
}

export function getenvJson5<T> (key: string, defaultVal?: T): unknown {
  return json5parseOrDefault(getenv(key), defaultVal)
}

export function getPort (): number {
  return _.toInteger(getenv('PORT', 5000))
}

export function getSiteurl (path: string = '/'): string {
  return new URL(path, getenv('BASEURL', `http://localhost:${getPort()}`)).href
}

export const isDevelopment = getenv('NODE_ENV', 'dev') === 'dev'
