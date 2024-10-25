/*
  Warnings:

  - You are about to drop the column `authSecurityId` on the `active_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `authId` on the `auth_security` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `auth_security` table. All the data in the column will be lost.
  - You are about to drop the column `passwordChangeAttempts` on the `auth_security` table. All the data in the column will be lost.
  - You are about to drop the column `authSecurityId` on the `blacklisted_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expiredAt` on the `blacklisted_sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[auth_id]` on the table `auth_security` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_security_id` to the `active_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_id` to the `auth_security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_security_id` to the `blacklisted_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `blacklisted_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "active_sessions" DROP CONSTRAINT "active_sessions_authSecurityId_fkey";

-- DropForeignKey
ALTER TABLE "auth_security" DROP CONSTRAINT "auth_security_authId_fkey";

-- DropForeignKey
ALTER TABLE "blacklisted_sessions" DROP CONSTRAINT "blacklisted_sessions_authSecurityId_fkey";

-- DropIndex
DROP INDEX "auth_security_authId_key";

-- AlterTable
ALTER TABLE "active_sessions" DROP COLUMN "authSecurityId",
ADD COLUMN     "auth_security_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "auth_security" DROP COLUMN "authId",
DROP COLUMN "loginAttempts",
DROP COLUMN "passwordChangeAttempts",
ADD COLUMN     "auth_id" TEXT NOT NULL,
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "password_change_attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "blacklisted_sessions" DROP COLUMN "authSecurityId",
DROP COLUMN "expiredAt",
ADD COLUMN     "auth_security_id" TEXT NOT NULL,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "auth_security_auth_id_key" ON "auth_security"("auth_id");

-- AddForeignKey
ALTER TABLE "auth_security" ADD CONSTRAINT "auth_security_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_sessions" ADD CONSTRAINT "blacklisted_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
