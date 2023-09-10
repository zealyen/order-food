import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm'
import { Menu, Order } from '@/entity'

export class GPSPointInput {
  x: number
  y: number
}

@Entity('Restaurants')
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'varchar', length: '127', nullable: false })
    name: string

  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326, nullable: false })
  @Index('geolocation', { spatial: true })
    geolocation: GPSPointInput

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date

  @OneToMany(() => Menu, menu => menu.restaurant)
    menus: Menu[] | null

  @OneToMany(() => Order, order => order.restaurant)
    orders: Order[] | null
}
