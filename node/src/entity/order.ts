import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { OrderStatus } from '@/enum/order'
import { OrderDetail, Restaurant } from '@/entity'

@Entity('Orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'varchar', length: '31', nullable: false })
    orderNumber: string

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.QUEUE, nullable: false })
    state: OrderStatus

  @Column({ type: 'int', nullable: true })
    restaurantId: number

  @ManyToOne(() => Restaurant, restaurant => restaurant.orders)
  @JoinColumn({ name: 'restaurantId', referencedColumnName: 'id' })
    restaurant: Restaurant

  @Column({ type: 'smallint', nullable: true })
    totalPrice: number

  @Column({ type: 'varchar', length: '31', nullable: true })
    userPhone: string

  @Column({ type: 'varchar', length: '127', nullable: true })
    userName: string

  @Column({ type: 'point', nullable: true })
    userGeolocation: string

  @Column({ type: 'varchar', length: '31', nullable: true })
    deliveryPhone: string

  @Column({ type: 'varchar', length: '127', nullable: true })
    deliveryName: string

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
    orderDetails: OrderDetail[] | null
}
