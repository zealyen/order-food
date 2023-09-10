import _ from 'lodash'
// import axios from 'axios'
import JSON5 from 'json5'
// import Papa from 'papaparse'

export function json5parseOrDefault (json5?: any, defaultVal?: any): unknown {
  try {
    return typeof json5 === 'string' ? JSON5.parse(json5) : defaultVal
  } catch (err) {
    return defaultVal
  }
}

export function randomBase62 (len: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return _.times(len, () => _.sample(chars)).join('')
}

const HEXADECIMAL_REGEX = /^[a-f0-9]+$/i
export function validateHex (value: any): void {
  if (typeof value !== 'string') {
    throw Error('Value is not string')
  }

  if (!HEXADECIMAL_REGEX.test(value)) {
    throw Error('Value is not a valid hexadecimal value')
  }
}
