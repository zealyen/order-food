import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm'

export class Menu1694320217069 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'Menus',
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'int',
        },
        {
          name: 'productName',
          type: 'varchar',
          length: '127',
          isNullable: false,
        },
        {
          name: 'price',
          type: 'smallint',
          isNullable: false,
        },
        {
          name: 'restaurantId',
          type: 'int',
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

    await queryRunner.createForeignKey('Menus', new TableForeignKey({
      name: 'fk_menu_restaurant',
      columnNames: ['restaurantId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'Restaurants',
      onDelete: 'CASCADE',
    }))

    await queryRunner.createIndex('Menus', new TableIndex({
      columnNames: ['restaurantId'],
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
