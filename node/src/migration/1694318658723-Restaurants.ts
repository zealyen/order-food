import { Table, type MigrationInterface, type QueryRunner } from 'typeorm'

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
          name: 'name',
          type: 'varchar',
          length: '127',
          isNullable: false,
        },
        {
          name: 'geolocation',
          type: 'point',
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
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
  }
}
