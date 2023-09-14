import { Menu, Restaurant, StoreBrand } from '@/entity'
import { mysql } from '@/lib/mysql'
import _ from 'lodash'

export const kfcMenus = [
  {
    productName: '蛋塔一盒',
    price: 120,
  },
  {
    productName: '6塊炸雞',
    price: 299,
  },
  {
    productName: '8塊炸雞',
    price: 399,
  },
  {
    productName: '薯條一包',
    price: 50,
  },
  {
    productName: '可樂一杯',
    price: 50,
  },
  {
    productName: '卡拉雞腿堡套餐',
    price: 150,
  },
  {
    productName: '黃金起司豬排堡套餐',
    price: 150,
  },
  {
    productName: 'XL卡拉雞腿堡套餐',
    price: 189,
  },
]

export const mcdonaldsMenus = [
  {
    productName: '薯條一包',
    price: 50,
  },
  {
    productName: '可樂一杯',
    price: 50,
  },
  {
    productName: '麥香雞一塊',
    price: 50,
  },
  {
    productName: '麥香魚堡套餐',
    price: 120,
  },
  {
    productName: '麥克雞塊六塊',
    price: 119,
  },
  {
    productName: '雙層牛肉吉事堡套餐',
    price: 130,
  },
]

export default async function seeder (): Promise<void> {
  try {
    const storeBrands = await mysql.getRepository(StoreBrand).find()
    const menus: Menu[] = []
    for (const storeBrand of storeBrands) {
      menus.push(..._.map((/^[KFC]{3}/.test(storeBrand.name) ? kfcMenus : mcdonaldsMenus), menu => _.merge(new Menu(), menu, { storeBrandId: storeBrand.id })))
    }

    await mysql.manager.save(Menu, menus)
  } catch (error) {
    throw _.merge(error, { message: 'Seeder menu failed.' })
  }
}
