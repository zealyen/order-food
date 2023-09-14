import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Restaurant, Menu } from '@/entity'

@Entity('StoreBrands')
export class StoreBrand extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'varchar', length: '127', nullable: false })
    name: string

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date

  @OneToMany(() => Restaurant, restaurant => restaurant.storeBrand)
    restaurants: Restaurant[] | null

  @OneToMany(() => Menu, menu => menu.storeBrand)
    menus: Menu[] | null
}
