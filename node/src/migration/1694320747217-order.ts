import { Table, type MigrationInterface, type QueryRunner, TableForeignKey } from 'typeorm'

export class Order1694320747217 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'Orders',
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'int',
        },
        {
          name: 'orderNumber',
          type: 'varchar',
          length: '31',
          isNullable: false,
        },
        {
          name: 'state',
          isNullable: false,
          type: 'enum',
          enum: ['QUEUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
          default: '"QUEUE"',
        },
        {
          name: 'restaurantId',
          type: 'int',
          isNullable: true,
        },
        {
          name: 'totalPrice',
          type: 'smallint',
          isNullable: true,
        },
        {
          name: 'userPhone',
          type: 'varchar',
          length: '31',
          isNullable: true,
        },
        {
          name: 'userName',
          type: 'varchar',
          length: '127',
          isNullable: true,
        },
        {
          name: 'userGeolocation',
          type: 'point',
          isNullable: true,
        },
        {
          name: 'deliveryPhone',
          type: 'varchar',
          length: '31',
          isNullable: true,
        },
        {
          name: 'deliveryName',
          type: 'varchar',
          length: '127',
          isNullable: true,
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
        },
      ],
    }))

    await queryRunner.createForeignKey('Orders', new TableForeignKey({
      name: 'fk_order_restaurant',
      columnNames: ['restaurantId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'Restaurants',
      onDelete: 'SET NULL',
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
