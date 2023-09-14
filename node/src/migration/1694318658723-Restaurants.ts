import { Table, type MigrationInterface, type QueryRunner, TableIndex, TableForeignKey } from 'typeorm'

export class Restaurants1694318658723 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'Restaurants',
      columns: [
        {
          name: 'id',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
          type: 'int',
        },
        {
          name: 'storeBrandId',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'name',
          type: 'varchar',
          length: '127',
          isNullable: false,
        },
        // https://dev.mysql.com/doc/refman/8.0/en/creating-spatial-indexes.html
        {
          name: 'geolocation',
          type: 'point',
          isNullable: false,
          srid: 4326,
          spatialFeatureType: 'Point',
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
      'Restaurants',
      new TableIndex({
        columnNames: ['storeBrandId'],
        name: 'index_restaurant_storeBrandId',
      })
    )

    await queryRunner.createForeignKey('Restaurants', new TableForeignKey({
      name: 'fk_restaurant_storeBrandId',
      columnNames: ['storeBrandId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'StoreBrands',
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
