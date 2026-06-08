-- ============================================
-- Step 1: 标记失败的迁移为回滚状态
-- ============================================
-- 在项目目录执行:
-- npx prisma migrate resolve --rolled-back 20260608065640_change_bigint_to_varchar


-- ============================================
-- Step 2: 手动删除所有外键约束（直接连接数据库执行）
-- ============================================

-- 查看所有外键
-- SELECT 
--     TABLE_NAME, 
--     CONSTRAINT_NAME,
--     COLUMN_NAME,
--     REFERENCED_TABLE_NAME,
--     REFERENCED_COLUMN_NAME
-- FROM 
--     INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE 
--     REFERENCED_TABLE_SCHEMA = 'your_database_name'
--     AND REFERENCED_TABLE_NAME IS NOT NULL;


-- 删除外键（根据实际外键名称执行）

-- company_admins 表
ALTER TABLE `company_admins` DROP FOREIGN KEY `company_admins_company_id_fkey`;
ALTER TABLE `company_admins` DROP FOREIGN KEY `company_admins_user_id_fkey`;

-- teams 表
ALTER TABLE `teams` DROP FOREIGN KEY `teams_company_id_fkey`;

-- users 表
ALTER TABLE `users` DROP FOREIGN KEY `users_team_id_fkey`;

-- demands 表
ALTER TABLE `demands` DROP FOREIGN KEY `demands_user_id_fkey`;

-- quotes 表
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_demand_id_fkey`;
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_team_id_fkey`;
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_company_id_fkey`;

-- orders 表
ALTER TABLE `orders` DROP FOREIGN KEY `orders_demand_id_fkey`;
ALTER TABLE `orders` DROP FOREIGN KEY `orders_user_id_fkey`;
ALTER TABLE `orders` DROP FOREIGN KEY `orders_team_id_fkey`;
ALTER TABLE `orders` DROP FOREIGN KEY `orders_company_id_fkey`;

-- construction_logs 表
ALTER TABLE `construction_logs` DROP FOREIGN KEY `construction_logs_order_id_fkey`;
ALTER TABLE `construction_logs` DROP FOREIGN KEY `construction_logs_team_id_fkey`;

-- messages 表
ALTER TABLE `messages` DROP FOREIGN KEY `messages_order_id_fkey`;
ALTER TABLE `messages` DROP FOREIGN KEY `messages_sender_id_fkey`;
ALTER TABLE `messages` DROP FOREIGN KEY `messages_receiver_id_fkey`;

-- reviews 表
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_order_id_fkey`;
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_user_id_fkey`;
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_team_id_fkey`;

-- cases 表
ALTER TABLE `cases` DROP FOREIGN KEY `cases_team_id_fkey`;
ALTER TABLE `cases` DROP FOREIGN KEY `cases_company_id_fkey`;


-- ============================================
-- Step 3: 修改字段类型（BIGINT -> VARCHAR(64)）
-- ============================================

-- users 表
ALTER TABLE `users` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `users` MODIFY `team_id` VARCHAR(64) DEFAULT NULL;

-- companies 表
ALTER TABLE `companies` MODIFY `id` VARCHAR(64) NOT NULL;

-- company_admins 表
ALTER TABLE `company_admins` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `company_admins` MODIFY `company_id` VARCHAR(64) NOT NULL;
ALTER TABLE `company_admins` MODIFY `user_id` VARCHAR(64) NOT NULL;

-- teams 表
ALTER TABLE `teams` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `teams` MODIFY `company_id` VARCHAR(64) NOT NULL;

-- demands 表
ALTER TABLE `demands` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `demands` MODIFY `user_id` VARCHAR(64) NOT NULL;

-- quotes 表
ALTER TABLE `quotes` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `quotes` MODIFY `demand_id` VARCHAR(64) NOT NULL;
ALTER TABLE `quotes` MODIFY `team_id` VARCHAR(64) NOT NULL;
ALTER TABLE `quotes` MODIFY `company_id` VARCHAR(64) NOT NULL;
ALTER TABLE `quotes` MODIFY `reviewed_by` VARCHAR(64) DEFAULT NULL;

-- orders 表
ALTER TABLE `orders` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `orders` MODIFY `demand_id` VARCHAR(64) NOT NULL;
ALTER TABLE `orders` MODIFY `user_id` VARCHAR(64) NOT NULL;
ALTER TABLE `orders` MODIFY `team_id` VARCHAR(64) NOT NULL;
ALTER TABLE `orders` MODIFY `company_id` VARCHAR(64) NOT NULL;
ALTER TABLE `orders` MODIFY `created_by` VARCHAR(64) NOT NULL;

-- construction_logs 表
ALTER TABLE `construction_logs` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `construction_logs` MODIFY `order_id` VARCHAR(64) NOT NULL;
ALTER TABLE `construction_logs` MODIFY `team_id` VARCHAR(64) NOT NULL;

-- messages 表
ALTER TABLE `messages` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `messages` MODIFY `order_id` VARCHAR(64) NOT NULL;
ALTER TABLE `messages` MODIFY `sender_id` VARCHAR(64) NOT NULL;
ALTER TABLE `messages` MODIFY `receiver_id` VARCHAR(64) NOT NULL;

-- reviews 表
ALTER TABLE `reviews` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `reviews` MODIFY `order_id` VARCHAR(64) NOT NULL;
ALTER TABLE `reviews` MODIFY `user_id` VARCHAR(64) NOT NULL;
ALTER TABLE `reviews` MODIFY `team_id` VARCHAR(64) NOT NULL;

-- cases 表
ALTER TABLE `cases` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `cases` MODIFY `team_id` VARCHAR(64) NOT NULL;
ALTER TABLE `cases` MODIFY `company_id` VARCHAR(64) NOT NULL;

-- files 表
ALTER TABLE `files` MODIFY `id` VARCHAR(64) NOT NULL;

-- compliance_docs 表
ALTER TABLE `compliance_docs` MODIFY `id` VARCHAR(64) NOT NULL;

-- event_logs 表
ALTER TABLE `event_logs` MODIFY `id` VARCHAR(64) NOT NULL;
ALTER TABLE `event_logs` MODIFY `biz_id` VARCHAR(64) NOT NULL;
