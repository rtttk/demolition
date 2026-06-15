-- MySQL dump 10.13  Distrib 8.0.25, for macos11 (x86_64)
--
-- Host: localhost    Database: demolition
-- ------------------------------------------------------
-- Server version	8.0.25

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('5b31eb2b-06ce-489c-894e-dec6d2f98e52','8678d32ba2ac839c4faa123a64acc348c062f7e18af3333934969874688ac849','2026-05-25 07:05:43.105','20260525070543_add_demand_fields',NULL,NULL,'2026-05-25 07:05:43.072',1),('6ab45deb-692a-4560-b515-fa7585e8c36b','743df7b1e1071789791dedc93f26900fb2b633ee799ea5215168c7b2584dbaf6','2026-06-05 08:38:58.615','20260605083858_add_roles_field',NULL,NULL,'2026-06-05 08:38:58.437',1),('9aa66d3b-7bf9-439d-b8f3-69ce8965ce7c','a598f2fcdc143deddda73abcbe72dc50630f3ab010fb6f95e9c20838c385958b','2026-04-28 03:12:02.161','20260428031201_init',NULL,NULL,'2026-04-28 03:12:01.206',1),('bbbc8ab0-4aec-4145-b0c0-f87573d57104','3499615041c9598b5eaf777fa87f65f3933199eb4ec5f355790440f16e71b2ae','2026-06-08 06:47:34.287','20260608064733_change_bigint_to_varchar',NULL,NULL,'2026-06-08 06:47:33.245',1),('cf772c27-586f-43e7-8a1f-7d7e1296ef9f','596537797637380b51f359c219417d35cab0cc694696256b2d79aed7b0afaf1b',NULL,'20260608065640_change_bigint_to_varchar','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260608065640_change_bigint_to_varchar\n\nDatabase error code: 1833\n\nDatabase error:\nCannot change column \'id\': used in a foreign key constraint \'company_admins_company_id_fkey\' of table \'demolition.company_admins\'\n\nPlease check the query number 2 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260608065640_change_bigint_to_varchar\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260608065640_change_bigint_to_varchar\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-08 07:36:46.090','2026-06-08 06:56:40.054',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `demo_type` int NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `before_image_ids` json DEFAULT NULL,
  `after_image_ids` json DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `recommended` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cases_team_id_idx` (`team_id`),
  KEY `cases_company_id_idx` (`company_id`),
  KEY `cases_demo_type_idx` (`demo_type`),
  KEY `cases_recommended_idx` (`recommended`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES ('cmqak12k40000yn3g6sph7bzl','team_test_004','cmp_test_003','碧云鳢悦135平拆除',1,NULL,NULL,135.00,5,'[\"cmqajxirq000011g221d6l0e9\", \"cmqajxpnu000111g2s5b9b3c1\"]','[\"cmqajxumj000211g2ayiphkz9\"]',1,4,'2026-06-12 06:37:34.900','2026-06-12 07:52:14.101',1);
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_images` json DEFAULT NULL,
  `qualification` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualification_images` json DEFAULT NULL,
  `safety_cert_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `safety_cert_images` json DEFAULT NULL,
  `established_at` datetime(3) DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_area` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_count` int NOT NULL DEFAULT '0',
  `team_count` int NOT NULL DEFAULT '0',
  `verify_status` int NOT NULL DEFAULT '0',
  `verify_remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companies_verify_status_idx` (`verify_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES ('cmp_test_001','上海顺发拆除有限公司','张经理','13800138001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,2,1,NULL,1,'2026-06-10 11:47:46.142','2026-06-10 11:47:46.142'),('cmp_test_002','上海诚信拆除有限公司','李经理','13800138002',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,1,NULL,1,'2026-06-10 11:47:46.162','2026-06-10 11:47:46.162'),('cmp_test_003','上海高效拆除有限公司','王经理','13800138003',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,1,NULL,1,'2026-06-10 11:47:46.167','2026-06-10 11:47:46.167');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_admins`
--

DROP TABLE IF EXISTS `company_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_admins` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_admins_company_id_user_id_key` (`company_id`,`user_id`),
  KEY `company_admins_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_admins`
--

LOCK TABLES `company_admins` WRITE;
/*!40000 ALTER TABLE `company_admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `company_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compliance_docs`
--

DROP TABLE IF EXISTS `compliance_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compliance_docs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_id` int DEFAULT NULL,
  `file_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compliance_docs_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compliance_docs`
--

LOCK TABLES `compliance_docs` WRITE;
/*!40000 ALTER TABLE `compliance_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `compliance_docs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `construction_logs`
--

DROP TABLE IF EXISTS `construction_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `construction_logs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_date` datetime(3) NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `progress` int DEFAULT NULL,
  `workers` int DEFAULT NULL,
  `image_ids` json DEFAULT NULL,
  `video_ids` json DEFAULT NULL,
  `is_abnormal` tinyint(1) NOT NULL DEFAULT '0',
  `abnormal_desc` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `construction_logs_order_id_log_date_key` (`order_id`,`log_date`),
  KEY `construction_logs_order_id_idx` (`order_id`),
  KEY `construction_logs_log_date_idx` (`log_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `construction_logs`
--

LOCK TABLES `construction_logs` WRITE;
/*!40000 ALTER TABLE `construction_logs` DISABLE KEYS */;
INSERT INTO `construction_logs` VALUES ('cmqewajy30002c09nlc2kp0h4','od1781311775','team_test_003','2026-06-15 00:00:00.000','123123123231123123123123',70,NULL,'[\"cmqew1yfq0000c09ntnfp7z1d\"]','[]',0,NULL,'2026-06-15 07:31:57.434','2026-06-15 08:13:52.192');
/*!40000 ALTER TABLE `construction_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demands`
--

DROP TABLE IF EXISTS `demands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demands` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `demand_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `demo_type` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `expected_time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_ids` json DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `selected_quote_ids` json DEFAULT NULL,
  `quote_count` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  `expired_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `budget` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `community_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `demands_demand_no_key` (`demand_no`),
  KEY `demands_user_id_idx` (`user_id`),
  KEY `demands_status_idx` (`status`),
  KEY `demands_district_idx` (`district`),
  KEY `demands_demo_type_idx` (`demo_type`),
  KEY `demands_expired_at_idx` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demands`
--

LOCK TABLES `demands` WRITE;
/*!40000 ALTER TABLE `demands` DISABLE KEYS */;
INSERT INTO `demands` VALUES ('1','DM20260605432625','9',1,'111拆除项目','123123','111',NULL,NULL,NULL,123.00,'三个月内','null',0,NULL,0,4,'2026-06-12 03:34:33.153',NULL,'2026-06-05 03:34:33.161','2026-06-12 01:34:12.818','10万-50万元','111','123123','12312312312'),('cmq7nb6nu0000h9pw9i0o6zm7','DM20260610848729','9',1,'测试小区拆除项目','这是一个测试需求','上海市浦东新区测试路123号',NULL,NULL,NULL,NULL,NULL,'[\"cmq7n9bpu0000ovp6znmyogtg\"]',0,NULL,0,1,'2026-06-17 05:46:07.095',NULL,'2026-06-10 05:46:07.098','2026-06-12 01:34:08.123',NULL,'测试小区','测试联系人','13800138000'),('cmq7nbilo0002h9pwgxjo5ura','DM20260610505572','9',1,'测试小区拆除项目','这是一个测试需求','上海市浦东新区测试路123号',NULL,NULL,NULL,NULL,NULL,'[\"cmq7n9bpu0000ovp6znmyogtg\"]',0,NULL,0,9,'2026-06-17 05:46:22.571',NULL,'2026-06-10 05:46:22.572','2026-06-15 09:32:09.901',NULL,'测试小区','测试联系人','13800138000'),('cmq7nwxgm00029phral1vfe5y','DM20260610488605','9',1,'123123拆除项目','123123','123123',NULL,NULL,NULL,111.00,'一个月内','null',5,'[\"cmqa83t560000rqxjsmaksnro\"]',1,23,'2026-06-17 06:03:01.601','2026-06-15 09:36:47.525','2026-06-10 06:03:01.605','2026-06-15 09:36:47.543','1万-5万元','123123','23123123','12312312312');
/*!40000 ALTER TABLE `demands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_logs`
--

DROP TABLE IF EXISTS `event_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_logs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `biz_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `biz_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `operator_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` json DEFAULT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `event_logs_biz_type_biz_id_idx` (`biz_type`,`biz_id`),
  KEY `event_logs_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_logs`
--

LOCK TABLES `event_logs` WRITE;
/*!40000 ALTER TABLE `event_logs` DISABLE KEYS */;
INSERT INTO `event_logs` VALUES ('1','demand','1','create','9','\"{\\\"demandNo\\\":\\\"DM20260605432625\\\",\\\"title\\\":\\\"111拆除项目\\\"}\"',NULL,'2026-06-05 03:34:33.228'),('cmq7nb6op0001h9pwgtcj3a8v','demand','cmq7nb6nu0000h9pw9i0o6zm7','create','9','\"{\\\"demandNo\\\":\\\"DM20260610848729\\\",\\\"title\\\":\\\"测试小区拆除项目\\\"}\"',NULL,'2026-06-10 05:46:07.130'),('cmq7nbilv0003h9pw06rmaaul','demand','cmq7nbilo0002h9pwgxjo5ura','create','9','\"{\\\"demandNo\\\":\\\"DM20260610505572\\\",\\\"title\\\":\\\"测试小区拆除项目\\\"}\"',NULL,'2026-06-10 05:46:22.579'),('cmq7nwxh400039phrginmgiox','demand','cmq7nwxgm00029phral1vfe5y','create','9','\"{\\\"demandNo\\\":\\\"DM20260610488605\\\",\\\"title\\\":\\\"123123拆除项目\\\"}\"',NULL,'2026-06-10 06:03:01.624'),('cmq9c4zy50000n2921nzo5jvb','user','9','admin_assign_team','1','\"{\\\"targetId\\\":\\\"9\\\",\\\"oldTeamId\\\":null,\\\"newTeamId\\\":\\\"team_test_003\\\"}\"',NULL,'2026-06-11 10:08:55.037'),('cmq9c53jt0001n292wcno0xeo','user','4','admin_assign_team','1','\"{\\\"targetId\\\":\\\"4\\\",\\\"oldTeamId\\\":null,\\\"newTeamId\\\":\\\"team_test_003\\\"}\"',NULL,'2026-06-11 10:08:59.705'),('cmq9c56vc0002n292zlo3fypo','user','3','admin_assign_team','1','\"{\\\"targetId\\\":\\\"3\\\",\\\"oldTeamId\\\":null,\\\"newTeamId\\\":\\\"team_test_004\\\"}\"',NULL,'2026-06-11 10:09:04.009'),('cmq9c5e4r0003n292vw6m2tb5','user','1','admin_assign_team','1','\"{\\\"targetId\\\":\\\"1\\\",\\\"oldTeamId\\\":null,\\\"newTeamId\\\":\\\"team_test_002\\\"}\"',NULL,'2026-06-11 10:09:13.419'),('cmq9c5ogd0004n292w588gu1n','team','team_test_004','admin_set_leader','1','\"{\\\"teamId\\\":\\\"team_test_004\\\",\\\"userId\\\":\\\"3\\\",\\\"isLeader\\\":true}\"',NULL,'2026-06-11 10:09:26.798'),('cmq9c62pv0005n292rtmubait','team','team_test_003','admin_set_leader','1','\"{\\\"teamId\\\":\\\"team_test_003\\\",\\\"userId\\\":\\\"9\\\",\\\"isLeader\\\":true}\"',NULL,'2026-06-11 10:09:45.283'),('cmqa83t5o0001rqxjb5k70ntt','quote','cmqa83t560000rqxjsmaksnro','submit','9','\"{\\\"quoteNo\\\":\\\"QT20260612005435\\\",\\\"demandId\\\":\\\"cmq7nwxgm00029phral1vfe5y\\\",\\\"teamId\\\":\\\"team_test_003\\\",\\\"price\\\":11123}\"',NULL,'2026-06-12 01:03:47.293'),('cmqaca7sr000084mcz4xlv8mu','team','team_test_003','admin_update_status','1','\"{\\\"teamId\\\":\\\"team_test_003\\\",\\\"oldStatus\\\":1,\\\"newStatus\\\":0}\"',NULL,'2026-06-12 03:00:44.667'),('cmqaiq0ao0000idm2j3xlab6e','team','team_test_003','admin_update_status','1','\"{\\\"teamId\\\":\\\"team_test_003\\\",\\\"oldStatus\\\":0,\\\"newStatus\\\":1}\"',NULL,'2026-06-12 06:00:59.136'),('cmqaiq4g70001idm2o6lywdd5','team','team_test_004','admin_set_recommended','1','\"{\\\"teamId\\\":\\\"team_test_004\\\",\\\"recommended\\\":true}\"',NULL,'2026-06-12 06:01:04.519'),('cmqaiq6fd0002idm2kkbc71f4','team','team_test_002','admin_set_recommended','1','\"{\\\"teamId\\\":\\\"team_test_002\\\",\\\"recommended\\\":true}\"',NULL,'2026-06-12 06:01:07.082'),('cmqaiq8p90003idm2o7wgwjkq','team','team_test_001','admin_set_recommended','1','\"{\\\"teamId\\\":\\\"team_test_001\\\",\\\"recommended\\\":true}\"',NULL,'2026-06-12 06:01:10.029'),('cmqaiqadp0004idm2hfiwn115','team','team_test_003','admin_set_recommended','1','\"{\\\"teamId\\\":\\\"team_test_003\\\",\\\"recommended\\\":true}\"',NULL,'2026-06-12 06:01:12.205'),('cmqak12km0001yn3gathus2zu','case','cmqak12k40000yn3g6sph7bzl','admin_create','1','\"{\\\"title\\\":\\\"碧云鳢悦135平拆除\\\",\\\"teamId\\\":\\\"team_test_004\\\"}\"',NULL,'2026-06-12 06:37:34.918'),('cmqakerrj0000o478jnr5c34i','case','cmqak12k40000yn3g6sph7bzl','admin_review','1','\"{\\\"action\\\":\\\"passed\\\"}\"',NULL,'2026-06-12 06:48:14.095'),('cmqama83r0000vrgggbvty53k','case','cmqak12k40000yn3g6sph7bzl','admin_update','1','\"{\\\"fields\\\":[\\\"recommended\\\"]}\"',NULL,'2026-06-12 07:40:41.223'),('cmqaqypdi000069hmjuk9c8t3','quote','cmqa83t560000rqxjsmaksnro','admin_review','1','\"{\\\"action\\\":\\\"passed\\\",\\\"remark\\\":\\\"\\\"}\"',NULL,'2026-06-12 09:51:41.815'),('cmqas55df0000iuwaock9ad1h','demand','cmq7nwxgm00029phral1vfe5y','select_quotes','9','\"{\\\"quoteIds\\\":[\\\"cmqa83t560000rqxjsmaksnro\\\"]}\"',NULL,'2026-06-12 10:24:42.100'),('cmqejhed50000p11dso9pn5co','order','od1781311775','admin_approve','1','null',NULL,'2026-06-15 01:33:21.785'),('cmqekf3470002p11dwjubig4p','order','od1781311775','upload_contract','9','\"{\\\"contractId\\\":\\\"cmqekc1g90001p11dhmpew2h5\\\",\\\"planStartDate\\\":\\\"2026-06-15T00:00:00.000Z\\\"}\"',NULL,'2026-06-15 01:59:33.512'),('cmqem5c6i0000ih00f37vqudq','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 02:47:57.930'),('cmqenazqf0000ajb6nq5kuxtx','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:20:21.351'),('cmqene9zo0001ajb6g0s2isy3','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:22:54.613'),('cmqenf5290000125ezf6rduhg','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:23:34.882'),('cmqennrxk0000zhm86ip7d55q','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:30:17.768'),('cmqens8390001zhm8w6kpbkuy','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:33:45.333'),('cmqenucjr0000x34oi7gj1srl','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:35:24.423'),('cmqenw3e90000h6tzdflpfr3t','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 03:36:45.874'),('cmqerzchy0000fc772qjam5li','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:31:16.102'),('cmqes1cma0000kpd3v58ww7kp','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:32:49.571'),('cmqes5m7r000011jlgd6px4qr','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:36:08.631'),('cmqescei300009objhj0h5gvs','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:41:25.228'),('cmqesmsrc0000p6elhgspzfxn','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:49:30.265'),('cmqespgr80001p6elt83njia4','order','od1781311775','approve_contract','1','null',NULL,'2026-06-15 05:51:34.676'),('cmqesvhdx000061qv0vg326ps','order','od1781311775','approve_contract','1','\"{\\\"status\\\":3,\\\"isTodayOrBefore\\\":true}\"',NULL,'2026-06-15 05:56:15.429'),('cmqetegz60000zza7h5pe3gyn','user','9','admin_assign_team','1','\"{\\\"targetId\\\":\\\"9\\\",\\\"oldTeamId\\\":\\\"team_test_003\\\",\\\"newTeamId\\\":\\\"team_test_004\\\"}\"',NULL,'2026-06-15 06:11:01.362'),('cmqewa5ob0001c09nxs0ofnda','user','9','admin_assign_team','1','\"{\\\"targetId\\\":\\\"9\\\",\\\"oldTeamId\\\":\\\"team_test_004\\\",\\\"newTeamId\\\":\\\"team_test_003\\\"}\"',NULL,'2026-06-15 07:31:38.940'),('cmqewajyl0003c09nmdt22zhf','construction_log','cmqewajy30002c09nlc2kp0h4','create','9','\"{\\\"orderId\\\":\\\"od1781311775\\\",\\\"logDate\\\":\\\"2026-06-15\\\"}\"',NULL,'2026-06-15 07:31:57.454'),('cmqexsgdb0000s8fry9or6mof','construction_log','cmqewajy30002c09nlc2kp0h4','update','9','\"{\\\"content\\\":\\\"123123123231123123123123\\\",\\\"progress\\\":70,\\\"imageIds\\\":[\\\"cmqew1yfq0000c09ntnfp7z1d\\\"],\\\"videoIds\\\":[]}\"',NULL,'2026-06-15 08:13:52.223'),('cmqf0q7o300009ownfxq5dhmq','order','od1781311775','complete','9','null',NULL,'2026-06-15 09:36:06.483'),('cmqf0r3ct00019own2pmx97ti','order','od1781311775','accept','9','null',NULL,'2026-06-15 09:36:47.550'),('cmqf1kthm0001q8ld6iyfnvam','review','cmqf1ktgt0000q8ldbs5jed52','create','9','\"{\\\"orderId\\\":\\\"od1781311775\\\",\\\"rating\\\":5}\"',NULL,'2026-06-15 09:59:54.443');
/*!40000 ALTER TABLE `event_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` int NOT NULL,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `uploader_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `files_uploader_id_idx` (`uploader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES ('1',1,'dsvxG87OYU2decbfd690d011220da408997cffbdb349.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1780627973641-fda5659108f66fbe.png',53233,'image/png',NULL,NULL,NULL,0,NULL,'2026-06-05 02:54:00.800'),('cmq6buxec0000dwmyipjw4g38',1,'7kX5iDnRmPc0ecbfd690d011220da408997cffbdb349.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1780990666429-4062ee39f1ab78dd.png',53233,'image/png',NULL,NULL,NULL,0,'9','2026-06-09 07:37:46.635'),('cmq7n5nie0000rb97i65ig2i2',1,'æ°çæé¤_logo.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781070108748-fe01dfe168bae1f9.jpg',111567,'image/jpeg',NULL,NULL,NULL,0,'9','2026-06-10 05:41:48.990'),('cmq7n9bpu0000ovp6znmyogtg',1,'æ°çæé¤_logo.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781070280138-f0604aa495216b20.jpg',111567,'image/jpeg',NULL,NULL,NULL,0,'9','2026-06-10 05:44:40.338'),('cmq7npmnz00009phrond0fga6',1,'YLM0Ly0vtnkEecbfd690d011220da408997cffbdb349.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781071040875-69dbf5326657ce08.png',53233,'image/png',NULL,NULL,NULL,0,'9','2026-06-10 05:57:21.024'),('cmq7nwhml00019phrc419jrt4',1,'7kG7q7WoguEnecbfd690d011220da408997cffbdb349.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781071360920-adc778719ada4188.png',53233,'image/png',NULL,NULL,NULL,0,'9','2026-06-10 06:02:41.071'),('cmqajxirq000011g221d6l0e9',1,'bb.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781246088901-f5fa6546eef08a41.png',53233,'image/png',NULL,NULL,NULL,0,'1','2026-06-12 06:34:49.281'),('cmqajxpnu000111g2s5b9b3c1',1,'1699616292559.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781246098134-aa7c2429f29fb74f.jpg',184399,'image/jpeg',NULL,NULL,NULL,0,'1','2026-06-12 06:34:58.218'),('cmqajxumj000211g2ayiphkz9',1,'WechatIMG305.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781246104348-7dcbedc754cf87b7.jpg',200034,'image/jpeg',NULL,NULL,NULL,0,'1','2026-06-12 06:35:04.651'),('cmqekc1g90001p11dhmpew2h5',1,'lSBAzkJDSzLsb60c106b88c90a51910c80c2539ac045.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781488631155-ffb8356fe3fd55fd.jpg',184399,'image/jpeg',NULL,NULL,NULL,0,'9','2026-06-15 01:57:11.385'),('cmqesxkn0000161qvo3yj1b0o',1,'Lp0BwCnVJosX05ce59f8b71edcda3f21dada1a7a0cbf.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781503072693-f56e129dda95c1f0.png',476052,'image/png',NULL,NULL,NULL,0,'9','2026-06-15 05:57:52.956'),('cmqew1yfq0000c09ntnfp7z1d',1,'1TYoC86BcSaC3495676f45226e1019fbf053049e5501.jpg','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781508316098-e70bb35c2d377ee0.jpg',321937,'image/jpeg',NULL,NULL,NULL,0,'9','2026-06-15 07:25:16.309'),('cmqf1556q0000lkzpxd0bjkgq',1,'rt-d7wAazfz1ecbfd690d011220da408997cffbdb349.png','https://exam-woniu1.oss-cn-shanghai.aliyuncs.com/demolition/image/2026/06/1781516862877-95fd3c4a79aed896.png',53233,'image/png',NULL,NULL,NULL,0,'9','2026-06-15 09:47:43.106');
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_role` int NOT NULL,
  `receiver_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_ids` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `messages_order_id_idx` (`order_id`),
  KEY `messages_sender_id_idx` (`sender_id`),
  KEY `messages_receiver_id_idx` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `demand_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote_ids` json NOT NULL,
  `final_price` decimal(12,2) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `confirmed_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `accepted_at` datetime(3) DEFAULT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `contract_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_status` int NOT NULL DEFAULT '0',
  `plan_start_date` datetime(3) DEFAULT NULL,
  `signed_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_no_key` (`order_no`),
  UNIQUE KEY `orders_demand_id_key` (`demand_id`),
  KEY `orders_demand_id_idx` (`demand_id`),
  KEY `orders_user_id_idx` (`user_id`),
  KEY `orders_team_id_idx` (`team_id`),
  KEY `orders_company_id_idx` (`company_id`),
  KEY `orders_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('od1781311775','OD202606130849358633','cmq7nwxgm00029phral1vfe5y','9','team_test_003','cmp_test_002','[\"cmqa83t560000rqxjsmaksnro\"]',11123.00,5,'2026-06-15 01:33:21.752','2026-06-15 05:56:14.362','2026-06-15 09:36:47.525','2026-06-15 09:36:47.525','9','2026-06-13 08:49:35.000','2026-06-15 09:36:47.527','5',2,'2026-06-15 00:00:00.000','2026-06-15 05:56:14.362');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotes`
--

DROP TABLE IF EXISTS `quotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotes` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `demand_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `duration` int DEFAULT NULL,
  `plan_summary` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `review_remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `reviewed_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotes_quote_no_key` (`quote_no`),
  KEY `quotes_demand_id_idx` (`demand_id`),
  KEY `quotes_team_id_idx` (`team_id`),
  KEY `quotes_company_id_idx` (`company_id`),
  KEY `quotes_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotes`
--

LOCK TABLES `quotes` WRITE;
/*!40000 ALTER TABLE `quotes` DISABLE KEYS */;
INSERT INTO `quotes` VALUES ('cmqa83t560000rqxjsmaksnro','QT20260612005435','cmq7nwxgm00029phral1vfe5y','team_test_003','cmp_test_002',11123.00,1123,'11123',NULL,1,NULL,'2026-06-12 09:51:41.799','1','2026-06-12 01:03:47.274','2026-06-12 09:51:41.801');
/*!40000 ALTER TABLE `quotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_ids` json DEFAULT NULL,
  `reply_content` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_order_id_key` (`order_id`),
  KEY `reviews_team_id_idx` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('cmqf1ktgt0000q8ldbs5jed52','od1781311775','9','team_test_003',5,'123123123','null',NULL,1,'2026-06-15 09:59:54.414','2026-06-15 09:59:54.414');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leader_a_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leader_a_phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leader_b_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leader_b_phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team_size` int NOT NULL DEFAULT '1',
  `specialties` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_area` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_count` int NOT NULL DEFAULT '0',
  `avg_rating` decimal(2,1) NOT NULL DEFAULT '0.0',
  `review_count` int NOT NULL DEFAULT '0',
  `recommended` tinyint(1) NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `teams_company_id_idx` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES ('team_test_001','cmp_test_001','顺发拆除一队','张队长','13900139001',NULL,NULL,5,NULL,NULL,NULL,0,0.0,0,1,1,'2026-06-10 11:47:46.170','2026-06-12 06:01:10.022'),('team_test_002','cmp_test_001','顺发拆除二队','张副队','13900139002',NULL,NULL,4,NULL,NULL,NULL,0,0.0,0,1,1,'2026-06-10 11:47:46.179','2026-06-12 06:01:07.075'),('team_test_003','cmp_test_002','诚信拆除一队','李队长','13900139003',NULL,NULL,6,NULL,NULL,NULL,1,5.0,1,1,1,'2026-06-10 11:47:46.183','2026-06-15 09:59:54.432'),('team_test_004','cmp_test_003','高效拆除队','王队长','13900139004',NULL,NULL,5,NULL,NULL,NULL,0,0.0,0,1,1,'2026-06-10 11:47:46.186','2026-06-12 06:01:04.512');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `open_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `union_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nickname` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_role` int NOT NULL DEFAULT '1',
  `real_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` int DEFAULT NULL,
  `age` int DEFAULT NULL,
  `id_card_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_images` json DEFAULT NULL,
  `qualification_level` int DEFAULT NULL,
  `work_years` int DEFAULT NULL,
  `team_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_team_admin` tinyint(1) NOT NULL DEFAULT '0',
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secret_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `roles` json NOT NULL,
  `role_backup` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_open_id_key` (`open_id`),
  UNIQUE KEY `users_union_id_key` (`union_id`),
  KEY `users_team_id_idx` (`team_id`),
  KEY `users_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1',NULL,NULL,NULL,'admin',NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'team_test_002',0,'123456',NULL,1,'2026-06-15 07:31:30.317','2026-04-30 16:15:34.000','2026-06-15 07:31:30.318','[1, 2, 3]',NULL),('3',NULL,NULL,'13800000001','demander',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'team_test_004',1,'123456',NULL,1,'2026-05-25 06:59:15.850','2026-04-30 17:30:04.000','2026-06-11 10:09:26.795','[1]',NULL),('4',NULL,NULL,'13800000002','provider',NULL,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'team_test_003',0,'123456',NULL,1,NULL,'2026-04-30 17:30:10.000','2026-06-11 10:08:59.701','[1, 2]',NULL),('9','o5mu25BmAHs9rpIHKij4p6XHbk8Q',NULL,NULL,'用户_XHbk8Q',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'team_test_003',1,NULL,NULL,1,'2026-06-15 02:22:54.951','2026-06-03 12:11:47.731','2026-06-15 10:01:33.052','[1, 2]',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-15 19:17:18
