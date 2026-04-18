-- CreateTable
CREATE TABLE `QurbaniSkinPickup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `numberOfSkins` INTEGER NOT NULL DEFAULT 1,
    `preferredDate` DATETIME(3) NULL,
    `additionalDetails` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QurbaniSkinPickup_userId_idx`(`userId`),
    INDEX `QurbaniSkinPickup_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QurbaniSkinPickup` ADD CONSTRAINT `QurbaniSkinPickup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
