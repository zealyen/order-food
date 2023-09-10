import _ from 'lodash'
import { faker } from '@faker-js/faker'
import { mysql } from '@/lib/mysql'
import { Order, OrderDetail, Restaurant } from '@/entity'
import { OrderStatus } from '@/enum/order'

export default async function seeder (): Promise<void> {
  try {
    const kfc = await mysql.manager.findOne(Restaurant, { where: { name: 'KFC(南港餐廳)' }, relations: { menus: true } })

    const kfcMenus = _.map(kfc?.menus, menu => _.pick(menu, ['id', 'productName', 'price'])).slice(0, 3)

    const order = _.merge(new Order(), {
      restaurantId: _.toSafeInteger(kfc?.id),
      orderNumber: `DEV${faker.number.int({ min: 100000, max: 999999 })}`,
      state: OrderStatus.QUEUE,
      totalPrice: _.sumBy(kfcMenus, 'price'),
      userPhone: '0912345678',
      userName: 'Zeal',
      userGeolocation: 'POINT(25.0555716 121.6134462)',
      deliveryPhone: '0987654321',
      deliveryName: 'Tom',
    })

    const insertOrder = await mysql.manager.save(Order, order)

    const orderDetails = _.map(kfcMenus, menu => _.merge(new OrderDetail(), {
      orderId: _.toSafeInteger(insertOrder.id),
      menuId: _.toSafeInteger(menu.id),
      quantity: 1,
    }))

    await mysql.manager.save(OrderDetail, orderDetails)
  } catch (error) {
    throw _.merge(error, { message: 'Seeder order failed.' })
  }
}
