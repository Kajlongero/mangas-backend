-- DropForeignKey
ALTER TABLE "active_sessions" DROP CONSTRAINT "active_sessions_auth_security_id_fkey";

-- DropForeignKey
ALTER TABLE "auth" DROP CONSTRAINT "auth_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_info" DROP CONSTRAINT "auth_info_auth_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_security" DROP CONSTRAINT "auth_security_auth_id_fkey";

-- DropForeignKey
ALTER TABLE "background_images" DROP CONSTRAINT "background_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "background_images" DROP CONSTRAINT "background_images_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "blacklisted_sessions" DROP CONSTRAINT "blacklisted_sessions_auth_security_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_image_store_id_fkey";

-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_images" DROP CONSTRAINT "profile_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_images" DROP CONSTRAINT "profile_images_profile_id_fkey";

-- AlterTable
ALTER TABLE "background_images" ALTER COLUMN "profile_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "images" ALTER COLUMN "image_store_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profile_images" ALTER COLUMN "profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth" ADD CONSTRAINT "auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_info" ADD CONSTRAINT "auth_info_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_security" ADD CONSTRAINT "auth_security_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_sessions" ADD CONSTRAINT "blacklisted_sessions_auth_security_id_fkey" FOREIGN KEY ("auth_security_id") REFERENCES "auth_security"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_image_store_id_fkey" FOREIGN KEY ("image_store_id") REFERENCES "images_store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_images" ADD CONSTRAINT "background_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_images" ADD CONSTRAINT "background_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
