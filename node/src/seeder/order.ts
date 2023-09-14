import _ from 'lodash'
import { mysql } from '@/lib/mysql'
import { Order, StoreBrand } from '@/entity'
import { OrderStatus } from '@/enum/order'

export default async function seeder (): Promise<void> {
  try {
    const kfc = await mysql.manager.findOne(StoreBrand, { where: { name: 'KFC' }, relations: { menus: true, restaurants: true } })
    const restaurant = _.sample(kfc?.restaurants)
    const kfcMenus = _.map(kfc?.menus, menu => _.pick(menu, ['id', 'productName', 'price'])).slice(0, 3)

    const order = _.merge(new Order(), {
      restaurantId: restaurant?.id,
      orderNumber: `DEV${_.random(100000, 999999)}`,
      state: OrderStatus.QUEUE,
      totalPrice: _.sumBy(kfcMenus, 'price'),
      userPhone: '0912345678',
      userName: 'Zeal',
      userGeolocation: 'POINT(25053192 121607035)',
      deliveryPhone: '0987654321',
      deliveryName: 'Tom',
      details: _.map(kfcMenus, menu => ({
        productName: menu.productName,
        quantity: 1,
        price: menu.price,
      })),
    })

    await mysql.manager.save(Order, order)
  } catch (error) {
    console.log(error)
    throw _.merge(error, { message: 'Seeder order failed.' })
  }
}
