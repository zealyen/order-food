import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { OrderDetail, StoreBrand } from '@/entity'

@Entity('Menus')
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'varchar', length: '127', nullable: false })
    productName: string

  @Column({ type: 'smallint', nullable: false })
    price: number

  @Column({ type: 'int', nullable: false })
    storeBrandId: number

  @ManyToOne(() => StoreBrand, storeBrand => storeBrand.menus)
  @JoinColumn({ name: 'storeBrandId', referencedColumnName: 'id' })
    storeBrand: StoreBrand

  @CreateDateColumn()
    createdAt: Date

  @UpdateDateColumn()
    updatedAt: Date

  @DeleteDateColumn()
    deletedAt: Date
}
