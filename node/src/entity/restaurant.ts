import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Index, ManyToOne } from 'typeorm'
import { Order, StoreBrand } from '@/entity'

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

  @Column({ type: 'int', nullable: false })
    storeBrandId: number

  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326, nullable: false })
  @Index('geolocation', { spatial: true })
    geolocation: GPSPointInput

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date

  @ManyToOne(() => StoreBrand, storeBrand => storeBrand.restaurants)
    storeBrand: StoreBrand

  @OneToMany(() => Order, order => order.restaurant)
    orders: Order[] | null
}
