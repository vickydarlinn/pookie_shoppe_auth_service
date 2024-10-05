import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRestaurantSchema1728106441135 implements MigrationInterface {
  name = "CreateRestaurantSchema1728106441135";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "restaurants" table
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "address" character varying(255) NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_restaurant_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "restaurants" table
    await queryRunner.query(`DROP TABLE "restaurants"`);
  }
}
