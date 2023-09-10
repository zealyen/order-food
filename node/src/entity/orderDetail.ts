import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Menu, Order } from '@/entity'

@Entity('OrderDetails')
export class OrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'int', nullable: false })
    orderId: number

  @ManyToOne(() => Order, order => order.orderDetails)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
    order: Order

  @Column({ type: 'int', nullable: false })
    menuId: number

  @ManyToOne(() => Menu, menu => menu.orderDetails)
  @JoinColumn({ name: 'menuId', referencedColumnName: 'id' })
    menu: Menu

  @Column({ type: 'smallint', nullable: false })
    quantity: number

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date
}
