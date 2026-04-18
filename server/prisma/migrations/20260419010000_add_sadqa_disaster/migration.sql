-- CreateTable
CREATE TABLE `Sadqa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `donorEmail` VARCHAR(191) NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    `paymentMarkedAt` DATETIME(3) NULL,
    `paymentScreenshotUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Sadqa_userId_idx`(`userId`),
    INDEX `Sadqa_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `DisasterDonation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `donorEmail` VARCHAR(191) NULL,
    `campaignKey` VARCHAR(191) NOT NULL,
    `campaignLabel` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `notes` TEXT NULL,
    `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    `paymentMarkedAt` DATETIME(3) NULL,
    `paymentScreenshotUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `DisasterDonation_userId_idx`(`userId`),
    INDEX `DisasterDonation_status_idx`(`status`),
    INDEX `DisasterDonation_campaignKey_idx`(`campaignKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `Sadqa` ADD CONSTRAINT `Sadqa_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `DisasterDonation` ADD CONSTRAINT `DisasterDonation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
