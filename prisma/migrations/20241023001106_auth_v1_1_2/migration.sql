/*
  Warnings:

  - You are about to drop the column `token` on the `active_sessions` table. All the data in the column will be lost.
  - Added the required column `jti` to the `active_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "active_sessions" DROP COLUMN "token",
ADD COLUMN     "jti" TEXT NOT NULL;
