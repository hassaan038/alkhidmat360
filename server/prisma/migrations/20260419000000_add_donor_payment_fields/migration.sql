-- AlterTable
ALTER TABLE `OrphanSponsorship` ADD COLUMN `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentMarkedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentScreenshotUrl` VARCHAR(191) NULL;
-- AlterTable
ALTER TABLE `QurbaniDonation` ADD COLUMN `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentMarkedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentScreenshotUrl` VARCHAR(191) NULL;
-- AlterTable
ALTER TABLE `RationDonation` ADD COLUMN `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentMarkedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentScreenshotUrl` VARCHAR(191) NULL;
