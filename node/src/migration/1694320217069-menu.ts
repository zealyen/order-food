import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm'

export class Menu1694320217069 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'Menus',
      columns: [
        {
          name: 'id',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
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
          name: 'storeBrandId',
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

    await queryRunner.createIndex(
      'Menus',
      new TableIndex({
        columnNames: ['storeBrandId'],
        name: 'index_menu_storeBrandId',
      })
    )

    await queryRunner.createForeignKey('Menus', new TableForeignKey({
      name: 'fk_menu_storeBrandId',
      columnNames: ['storeBrandId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'StoreBrands',
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
