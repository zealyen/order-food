import { Restaurant } from '@/entity'
import { mysql } from '@/lib/mysql'
import _ from 'lodash'

export const restaurants = [
  {
    name: 'KFC(南港餐廳)',
    geolocation: 'POINT(25.0555716 121.6134462)',
  },
  {
    name: 'KFC(東湖三餐廳)',
    geolocation: 'POINT(25.0679319 121.5344215)',
  },
  {
    name: 'KFC(新店北新餐廳)',
    geolocation: 'POINT(24.9733392 121.5427716)',
  },
  {
    name: 'McDonalds(台北研究院餐廳)',
    geolocation: 'POINT(25.0524749 121.6163387)',
  },
  {
    name: 'McDonalds(永和餐廳)',
    geolocation: 'POINT(25.013203 121.5147515)',
  },
]

export default async function seeder (): Promise<void> {
  try {
    await mysql.manager.save(Restaurant, _.map(restaurants, res => _.merge(new Restaurant(), res)))
  } catch (error) {
    throw _.merge(error, { message: 'Seeder restaurant failed.' })
  }
}
