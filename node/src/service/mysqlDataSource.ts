import _ from 'lodash'
import { In, type Repository } from 'typeorm'
import { mysql } from '@/lib/mysql'
import DataLoader from 'dataloader'
import { Menu, Restaurant, StoreBrand } from '@/entity'

const storeBrandRepo: Repository<StoreBrand> = mysql.getRepository(StoreBrand)
const restaurantRepo: Repository<Restaurant> = mysql.getRepository(Restaurant)
const menuRepo: Repository<Menu> = mysql.getRepository(Menu)

export class MysqlDataSource {
  private orderByIds<T> (items: T[], ids: Array<number | string>, key: string = 'id'): Array<T | undefined> {
    const pairs = _.chain(items)
      .filter(item => !_.isNil(item[key]))
      .map(item => [item[key], item])
      .value() as Array<[number | string, T]>

    const map = new Map(pairs)
    return _.map(ids, id => map.get(id))
  }

  private readonly loadRestaurants = new DataLoader(async (ids: number[]) => {
    const restaurants = await restaurantRepo.findBy({ storeBrandId: In(ids) })
    const group = _.groupBy(restaurants, 'storeBrandId')
    return _.map(ids, id => group[id] ?? [])
  })

  async getRestaurantByStoreBrandId (id: number): Promise<Restaurant[] | undefined> {
    return await this.loadRestaurants.load(id)
  }

  private readonly loadStoreBrand = new DataLoader(async (ids: number[]) => {
    const storeBrands = await storeBrandRepo.findBy({ id: In(ids) })
    return this.orderByIds(storeBrands, ids, 'id')
  })

  async getStoreBrandById (id: number): Promise<StoreBrand | undefined> {
    return await this.loadStoreBrand.load(id)
  }

  private readonly loadRestaurant = new DataLoader(async (ids: number[]) => {
    const restaurants = await restaurantRepo.findBy({ id: In(ids) })
    return this.orderByIds(restaurants, ids, 'id')
  })

  async getRestaurantById (id: number): Promise<Restaurant | undefined> {
    return await this.loadRestaurant.load(id)
  }

  private readonly loadMenu = new DataLoader(async (ids: number[]) => {
    const menus = await menuRepo.findBy({ storeBrandId: In(ids) })
    const group = _.groupBy(menus, 'storeBrandId')
    return _.map(ids, id => group[id] ?? [])
  })

  async getMenuByStoreBrandId (id: number): Promise<Menu[] | undefined> {
    return await this.loadMenu.load(id)
  }
}
