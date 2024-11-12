/*
  Warnings:

  - A unique constraint covering the columns `[keyword]` on the table `images_store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyword` to the `images_store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images_store" ADD COLUMN     "keyword" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "images_store_keyword_key" ON "images_store"("keyword");
