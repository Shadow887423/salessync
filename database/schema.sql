-- ============================================================
-- SalesSync Dashboard — MySQL Database Schema & Security Hardening
-- Security Standards: Principle of Least Privilege, utf8mb4 charset,
-- strict SQL mode, and indexed query optimization.
-- ============================================================

-- 1. Create database with secure UTF-8 Unicode encoding
CREATE DATABASE IF NOT EXISTS `sales_dashboard` 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `sales_dashboard`;

-- 2. Drop table if exists for clean installation
DROP TABLE IF EXISTS `data_records`;

-- 3. Create hardened data_records table
CREATE TABLE `data_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(100) NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `record_date` DATE NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_data_records_category` (`category`),
    INDEX `idx_data_records_record_date` (`record_date`),
    INDEX `idx_data_records_composite` (`category`, `record_date`),
    -- Check constraints prevent negative values or corrupt dates at DB level
    CONSTRAINT `chk_sales_value_positive` CHECK (`value` > 0.00 AND `value` <= 9999999.99)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Security Hardening: Principle of Least Privilege User Setup
-- Run the following commands as MySQL ROOT to create a dedicated,
-- non-administrative application user. NEVER use 'root' in .env!
-- ============================================================

-- CREATE USER IF NOT EXISTS 'salessync_app'@'localhost' IDENTIFIED BY 'ChangeThisToAStrongRandomPassword123!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON `sales_dashboard`.* TO 'salessync_app'@'localhost';
-- FLUSH PRIVILEGES;

-- NOTE: Administrative permissions (DROP DATABASE, ALTER TABLE, GRANT OPTION,
-- FILE, SUPER, PROCESS) are strictly revoked from the application user.

-- ============================================================
-- 5. Sample Data (Realistic E-commerce & Retail Sales)
-- ============================================================

INSERT INTO `data_records` (`category`, `value`, `record_date`, `description`) VALUES
('Electronics', 1299.99, '2026-10-24', 'MacBook Air M3 purchase for design workstation'),
('Sports', 549.50, '2026-10-22', 'Pro Carbon Road Bike Helmet & Performance Accessories'),
('Home & Garden', 850.00, '2026-10-18', 'Solid Teak Outdoor Patio Dining Table'),
('Food & Beverage', 320.25, '2026-10-15', 'Quarterly Gourmet Coffee Beans & Artisan Tea Restock'),
('Clothing', 415.00, '2026-10-12', 'Winter Waterproof Parka and Thermal Gloves'),
('Electronics', 899.00, '2026-10-08', 'Dell UltraSharp 32-inch 4K USB-C Monitor'),
('Food & Beverage', 185.50, '2026-09-28', 'Corporate catering pastry and fruit baskets'),
('Sports', 320.00, '2026-09-21', 'Adjustable Dumbbell Set & Fitness Mat'),
('Clothing', 260.00, '2026-09-14', 'Premium Merino Wool Sweaters (Bundle of 2)'),
('Home & Garden', 620.00, '2026-09-07', 'Smart Hydroponic Indoor Herb Garden Kit'),
('Electronics', 1450.00, '2026-08-30', 'Enterprise Wi-Fi 6E Mesh Router Setup'),
('Sports', 780.00, '2026-08-22', 'Inflatable Stand-Up Paddleboard Package'),
('Food & Beverage', 450.00, '2026-08-15', 'Annual Specialty Wine Club Subscription'),
('Home & Garden', 380.00, '2026-08-04', 'Ergonomic Desk Chair with Lumbar Support'),
('Clothing', 195.00, '2026-07-27', 'Breathable Trail Running Shoes');
