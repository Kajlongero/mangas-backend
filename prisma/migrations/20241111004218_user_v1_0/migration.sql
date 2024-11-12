/*
  Warnings:

  - The primary key for the `auth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `auth` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `auth_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `auth_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `auth_security` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `auth_security` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `profile_image_id` on the `profile` table. All the data in the column will be lost.
  - The `id` column on the `profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[jti]` on the table `active_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jti]` on the table `blacklisted_sessions` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_authToroles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_preferencesToprofile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `auth_security_id` on the `active_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `auth_id` on the `auth_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `auth_id` on the `auth_security` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `auth_security_id` on the `blacklisted_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_authToroles" DROP CONSTRAINT "_authToroles_A_fkey";

-- DropForeignKey
ALTER TABLE "_preferencesToprofile" DROP CONSTRAINT "_preferencesToprofile_B_fkey";

-- DropForeignKey
ALTER TABLE "active_sessions" DROP CONSTRAINT "active_sessions_auth_security_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_info" DROP CONSTRAINT "auth_info_auth_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_security" DROP CONSTRAINT "auth_security_auth_id_fkey";

-- DropForeignKey
ALTER TABLE "blacklisted_sessions" DROP CONSTRAINT "blacklisted_sessions_auth_security_id_fkey";

-- AlterTable
ALTER TABLE "_authToroles" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_preferencesToprofile" DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "active_sessions" DROP COLUMN "auth_security_id",
ADD COLUMN     "auth_security_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "auth" DROP CONSTRAINT "auth_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "auth_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth_info" DROP CONSTRAINT "auth_info_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "auth_id",
ADD COLUMN     "auth_id" INTEGER NOT NULL,
ADD CONSTRAINT "auth_info_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth_security" DROP CONSTRAINT "auth_security_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "auth_id",
ADD COLUMN     "auth_id" INTEGER NOT NULL,
ADD CONSTRAINT "auth_security_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "blacklisted_sessions" DROP COLUMN "auth_security_id",
ADD COLUMN     "auth_security_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profile" DROP CONSTRAINT "profile_pkey",
DROP COLUMN "profile_image_id",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "image_store_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images_store" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "images_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "image_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_images" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "image_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "background_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_images_image_id_key" ON "profile_images"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_images_profile_id_key" ON "profile_images"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "background_images_image_id_key" ON "background_images"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "background_images_profile_id_key" ON "background_images"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "_authToroles_AB_unique" ON "_authToroles"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_preferencesToprofile_AB_unique" ON "_preferencesToprofile"("A", "B");

-- CreateIndex
CREATE INDEX "_preferencesToprofile_B_index" ON "_preferencesToprofile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_jti_key" ON "active_sessions"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "auth_info_auth_id_key" ON "auth_info"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_security_auth_id_key" ON "auth_security"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "blacklisted_sessions_jti_key" ON "blacklisted_sessions"("jti");

-- CreateIndex
CREATE INDEX "permissions_name_idx" ON "permissions"("name");

-- AddForeignKey
ALTER TABLE "auth_info" ADD CONSTRAINT "auth_info_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_security" ADD CONSTRAINT "auth_security_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_sessions" ADD CONSTRAINT "blacklisted_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_image_store_id_fkey" FOREIGN KEY ("image_store_id") REFERENCES "images_store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_images" ADD CONSTRAINT "background_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_images" ADD CONSTRAINT "background_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_authToroles" ADD CONSTRAINT "_authToroles_A_fkey" FOREIGN KEY ("A") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_preferencesToprofile" ADD CONSTRAINT "_preferencesToprofile_B_fkey" FOREIGN KEY ("B") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
