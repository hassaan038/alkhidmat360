-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` INTEGER NULL,

    UNIQUE INDEX `SystemConfig_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QurbaniListing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `weightKg` DECIMAL(10, 2) NULL,
    `totalHissas` INTEGER NOT NULL DEFAULT 7,
    `pricePerHissa` DECIMAL(10, 2) NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `pickupDate` DATETIME(3) NOT NULL,
    `pickupLocation` TEXT NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'FULL', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QurbaniListing_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QurbaniHissaBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `listingId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `hissaCount` INTEGER NOT NULL,
    `dedications` TEXT NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    `paymentMarkedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QurbaniHissaBooking_listingId_idx`(`listingId`),
    INDEX `QurbaniHissaBooking_userId_idx`(`userId`),
    INDEX `QurbaniHissaBooking_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QurbaniHissaBooking` ADD CONSTRAINT `QurbaniHissaBooking_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `QurbaniListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QurbaniHissaBooking` ADD CONSTRAINT `QurbaniHissaBooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
