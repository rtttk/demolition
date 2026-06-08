/*
  Warnings:

  - The primary key for the `cases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `cases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `companies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `companies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `company_admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `company_admins` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `compliance_docs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `compliance_docs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `construction_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `construction_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `demands` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `demands` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `event_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `event_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `files` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `quotes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `quotes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE `cases` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `companies` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `company_admins` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `compliance_docs` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `construction_logs` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `demands` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `event_logs` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `files` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `messages` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `quotes` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `reviews` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `teams` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(64) NOT NULL,
    ADD PRIMARY KEY (`id`);
