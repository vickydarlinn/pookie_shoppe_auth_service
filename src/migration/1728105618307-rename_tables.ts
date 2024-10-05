import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTables1728105618307 implements MigrationInterface {
  name = "RenameTables1728105618307";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename table "user" to "users"
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);

    // Rename table "refresh_token" to "refreshTokens"
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME TO "refreshTokens"`,
    );

    // Drop the old foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
    );

    // Update the foreign key to reference the renamed "users" table
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_8e913e288156c133999341156ad_new" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the foreign key to the old "user" table
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_8e913e288156c133999341156ad_new"`,
    );

    // Restore the original foreign key referencing the "user" table
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Rename table "refreshTokens" back to "refresh_token"
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" RENAME TO "refresh_token"`,
    );

    // Rename table "users" back to "user"
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);
  }
}
