-- Align Prisma's view of the sessions storage with the runtime table that
-- express-mysql-session auto-creates on boot. Drops the unused `Session`
-- table created by the init migration, and registers the actual `sessions`
-- table with Prisma so future `prisma migrate dev` runs no longer report
-- drift.

-- DropTable
DROP TABLE IF EXISTS `Session`;

-- CreateTable (idempotent — express-mysql-session may have already created this)
CREATE TABLE IF NOT EXISTS `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INT UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
