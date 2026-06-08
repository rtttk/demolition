/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_phone_idx` ON `users`;

-- DropIndex
DROP INDEX `users_role_idx` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role`,
    ADD COLUMN `roles` JSON NOT NULL;
