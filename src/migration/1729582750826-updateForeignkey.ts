import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForeignkey1729582750826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'restaurantId' column if it doesn't exist in users table
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "restaurantId" integer;
        `);

    // Drop the foreign key constraint on 'users' table (restaurantId) if it exists
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT IF EXISTS "FK_4ca7f2f579cda8a6158c7fc1650";
        `);

    // Add the foreign key constraint with ON DELETE CASCADE on 'users' table
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_4ca7f2f579cda8a6158c7fc1650"
            FOREIGN KEY ("restaurantId")
            REFERENCES "restaurants"("id")
            ON DELETE CASCADE;
        `);

    // Drop the foreign key constraint on 'refreshTokens' table if it exists
    await queryRunner.query(`
            ALTER TABLE "refreshTokens"
            DROP CONSTRAINT IF EXISTS "FK_265bec4e500714d5269580a0219";
        `);

    // Add the foreign key constraint with ON DELETE CASCADE on 'refreshTokens' table
    await queryRunner.query(`
            ALTER TABLE "refreshTokens"
            ADD CONSTRAINT "FK_265bec4e500714d5269580a0219"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes

    // Drop foreign key constraint on 'users' table
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT IF EXISTS "FK_4ca7f2f579cda8a6158c7fc1650";
        `);

    // Drop the 'restaurantId' column if you want to revert it completely
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN IF EXISTS "restaurantId";
        `);

    // Drop foreign key constraint on 'refreshTokens' table
    await queryRunner.query(`
            ALTER TABLE "refreshTokens"
            DROP CONSTRAINT IF EXISTS "FK_265bec4e500714d5269580a0219";
        `);

    // Re-add the original foreign key without ON DELETE CASCADE on 'users' table
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_4ca7f2f579cda8a6158c7fc1650"
            FOREIGN KEY ("restaurantId")
            REFERENCES "restaurants"("id")
            ON DELETE NO ACTION;
        `);

    // Re-add the original foreign key without ON DELETE CASCADE on 'refreshTokens' table
    await queryRunner.query(`
            ALTER TABLE "refreshTokens"
            ADD CONSTRAINT "FK_265bec4e500714d5269580a0219"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE NO ACTION;
        `);
  }
}
