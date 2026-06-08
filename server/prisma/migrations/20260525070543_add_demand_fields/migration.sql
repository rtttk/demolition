/*
  Warnings:

  - You are about to drop the column `floor` on the `demands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `demands` DROP COLUMN `floor`,
    ADD COLUMN `budget` VARCHAR(191) NULL,
    ADD COLUMN `community_name` VARCHAR(191) NULL,
    ADD COLUMN `contact_name` VARCHAR(191) NULL,
    ADD COLUMN `contact_phone` VARCHAR(191) NULL,
    MODIFY `longitude` DECIMAL(10, 7) NULL,
    MODIFY `latitude` DECIMAL(10, 7) NULL,
    MODIFY `area` DECIMAL(10, 2) NULL;
