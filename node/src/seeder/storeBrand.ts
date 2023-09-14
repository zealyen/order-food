import { StoreBrand } from '@/entity'
import { mysql } from '@/lib/mysql'
import _ from 'lodash'

export const storeBrands = [
  {
    name: 'KFC',
  },
  {
    name: 'McDonalds',
  },
]

export default async function seeder (): Promise<void> {
  try {
    await mysql.manager.save(StoreBrand, _.map(storeBrands, store => _.merge(new StoreBrand(), store)))
  } catch (error) {
    throw _.merge(error, { message: 'Seeder storeBrands failed.' })
  }
}
