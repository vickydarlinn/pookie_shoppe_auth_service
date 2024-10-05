import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRestaurantIdToUser1728107099139 implements MigrationInterface {
  name: "AddRestaurantIdToUser1728107099139";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add "restaurantId" column to "users" table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD "restaurantId" integer
    `);

    // Add foreign key constraint linking "restaurantId" in "users" to "id" in "restaurants"
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_restaurant_user" 
      FOREIGN KEY ("restaurantId") 
      REFERENCES "restaurants"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT "FK_restaurant_user"
    `);

    // Remove the "restaurantId" column
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "restaurantId"
    `);
  }
}
