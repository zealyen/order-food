import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { OrderDetail, Restaurant } from '@/entity'

@Entity('Menus')
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'varchar', length: '127', nullable: false })
    productName: string

  @Column({ type: 'smallint', nullable: false })
    price: number

  @Column({ type: 'int', nullable: false })
    restaurantId: number

  @ManyToOne(() => Restaurant, restaurant => restaurant.menus)
  @JoinColumn({ name: 'restaurantId', referencedColumnName: 'id' })
    restaurant: Restaurant

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
    orderDetails: OrderDetail[] | null
}
