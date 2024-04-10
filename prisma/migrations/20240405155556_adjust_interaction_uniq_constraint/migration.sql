/*
  Warnings:

  - You are about to drop the column `type` on the `source` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,book_id,type]` on the table `interaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "interaction_user_id_book_id_key";

-- AlterTable
ALTER TABLE "source" DROP COLUMN "type";

-- CreateIndex
CREATE UNIQUE INDEX "interaction_user_id_book_id_type_key" ON "interaction"("user_id", "book_id", "type");
