-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `open_id` VARCHAR(191) NULL,
    `union_id` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `nickname` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `role` INTEGER NOT NULL DEFAULT 1,
    `current_role` INTEGER NOT NULL DEFAULT 1,
    `real_name` VARCHAR(191) NULL,
    `gender` INTEGER NULL,
    `age` INTEGER NULL,
    `id_card_no` VARCHAR(191) NULL,
    `id_card_images` JSON NULL,
    `qualification_level` INTEGER NULL,
    `work_years` INTEGER NULL,
    `team_id` BIGINT NULL,
    `is_team_admin` BOOLEAN NOT NULL DEFAULT false,
    `password_hash` VARCHAR(191) NULL,
    `secret_key` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_open_id_key`(`open_id`),
    UNIQUE INDEX `users_union_id_key`(`union_id`),
    INDEX `users_phone_idx`(`phone`),
    INDEX `users_team_id_idx`(`team_id`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `contact_person` VARCHAR(191) NOT NULL,
    `contact_phone` VARCHAR(191) NOT NULL,
    `license_no` VARCHAR(191) NULL,
    `license_images` JSON NULL,
    `qualification` VARCHAR(191) NULL,
    `qualification_images` JSON NULL,
    `safety_cert_no` VARCHAR(191) NULL,
    `safety_cert_images` JSON NULL,
    `established_at` DATETIME(3) NULL,
    `description` VARCHAR(191) NULL,
    `service_area` VARCHAR(191) NULL,
    `completed_count` INTEGER NOT NULL DEFAULT 0,
    `team_count` INTEGER NOT NULL DEFAULT 0,
    `verify_status` INTEGER NOT NULL DEFAULT 0,
    `verify_remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `companies_verify_status_idx`(`verify_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_admins` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `company_admins_user_id_idx`(`user_id`),
    UNIQUE INDEX `company_admins_company_id_user_id_key`(`company_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `leader_a_name` VARCHAR(191) NOT NULL,
    `leader_a_phone` VARCHAR(191) NOT NULL,
    `leader_b_name` VARCHAR(191) NULL,
    `leader_b_phone` VARCHAR(191) NULL,
    `team_size` INTEGER NOT NULL DEFAULT 1,
    `specialties` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `service_area` VARCHAR(191) NULL,
    `completed_count` INTEGER NOT NULL DEFAULT 0,
    `avg_rating` DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `teams_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demands` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `demand_no` VARCHAR(191) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `demo_type` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `area` DECIMAL(10, 2) NOT NULL,
    `floor` INTEGER NULL,
    `expected_time` VARCHAR(191) NULL,
    `image_ids` JSON NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `selected_quote_ids` JSON NULL,
    `quote_count` INTEGER NOT NULL DEFAULT 0,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `expired_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `demands_demand_no_key`(`demand_no`),
    INDEX `demands_user_id_idx`(`user_id`),
    INDEX `demands_status_idx`(`status`),
    INDEX `demands_district_idx`(`district`),
    INDEX `demands_demo_type_idx`(`demo_type`),
    INDEX `demands_expired_at_idx`(`expired_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quote_no` VARCHAR(191) NOT NULL,
    `demand_id` BIGINT NOT NULL,
    `team_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `duration` INTEGER NULL,
    `plan_summary` VARCHAR(191) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `review_remark` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `reviewed_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quotes_quote_no_key`(`quote_no`),
    INDEX `quotes_demand_id_idx`(`demand_id`),
    INDEX `quotes_team_id_idx`(`team_id`),
    INDEX `quotes_company_id_idx`(`company_id`),
    INDEX `quotes_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(191) NOT NULL,
    `demand_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `team_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `quote_ids` JSON NOT NULL,
    `final_price` DECIMAL(12, 2) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `confirmed_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `accepted_at` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_order_no_key`(`order_no`),
    UNIQUE INDEX `orders_demand_id_key`(`demand_id`),
    INDEX `orders_demand_id_idx`(`demand_id`),
    INDEX `orders_user_id_idx`(`user_id`),
    INDEX `orders_team_id_idx`(`team_id`),
    INDEX `orders_company_id_idx`(`company_id`),
    INDEX `orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `construction_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `team_id` BIGINT NOT NULL,
    `log_date` DATETIME(3) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `progress` INTEGER NULL,
    `workers` INTEGER NULL,
    `image_ids` JSON NULL,
    `video_ids` JSON NULL,
    `is_abnormal` BOOLEAN NOT NULL DEFAULT false,
    `abnormal_desc` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `construction_logs_order_id_idx`(`order_id`),
    INDEX `construction_logs_log_date_idx`(`log_date`),
    UNIQUE INDEX `construction_logs_order_id_log_date_key`(`order_id`, `log_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `sender_role` INTEGER NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `content` VARCHAR(191) NULL,
    `image_ids` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_order_id_idx`(`order_id`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    INDEX `messages_receiver_id_idx`(`receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `team_id` BIGINT NOT NULL,
    `rating` INTEGER NOT NULL,
    `content` VARCHAR(191) NULL,
    `image_ids` JSON NULL,
    `reply_content` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_order_id_key`(`order_id`),
    INDEX `reviews_team_id_idx`(`team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cases` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `team_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `demo_type` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `area` DECIMAL(10, 2) NULL,
    `duration` INTEGER NULL,
    `before_image_ids` JSON NULL,
    `after_image_ids` JSON NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cases_team_id_idx`(`team_id`),
    INDEX `cases_company_id_idx`(`company_id`),
    INDEX `cases_demo_type_idx`(`demo_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `file_type` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NULL,
    `mime_type` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `uploader_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `files_uploader_id_idx`(`uploader_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compliance_docs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `file_id` INTEGER NULL,
    `file_url` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `compliance_docs_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `biz_type` VARCHAR(191) NOT NULL,
    `biz_id` BIGINT NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `operator_id` INTEGER NULL,
    `detail` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_logs_biz_type_biz_id_idx`(`biz_type`, `biz_id`),
    INDEX `event_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_admins` ADD CONSTRAINT `company_admins_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_admins` ADD CONSTRAINT `company_admins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demands` ADD CONSTRAINT `demands_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_demand_id_fkey` FOREIGN KEY (`demand_id`) REFERENCES `demands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_demand_id_fkey` FOREIGN KEY (`demand_id`) REFERENCES `demands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `construction_logs` ADD CONSTRAINT `construction_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `construction_logs` ADD CONSTRAINT `construction_logs_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cases` ADD CONSTRAINT `cases_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cases` ADD CONSTRAINT `cases_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
