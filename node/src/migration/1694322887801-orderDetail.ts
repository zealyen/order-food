import { Table, type MigrationInterface, type QueryRunner, TableForeignKey } from 'typeorm'

export class OrderDetail1694322887801 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'OrderDetails',
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'int',
        },
        {
          name: 'orderId',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'menuId',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'quantity',
          type: 'smallint',
          isNullable: false,
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

    await queryRunner.createForeignKey('OrderDetails', new TableForeignKey({
      columnNames: ['orderId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'Orders',
      onDelete: 'CASCADE',
    }))

    await queryRunner.createForeignKey('OrderDetails', new TableForeignKey({
      columnNames: ['menuId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'Menus',
      onDelete: 'CASCADE',
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
