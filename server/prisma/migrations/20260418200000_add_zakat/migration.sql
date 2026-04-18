-- CreateTable
CREATE TABLE `ZakatPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cashSavings` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `goldGrams` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `goldValue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `silverGrams` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `silverValue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `investments` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `businessAssets` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `otherAssets` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `liabilities` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `nisabBasis` VARCHAR(191) NOT NULL,
    `nisabThreshold` DECIMAL(15, 2) NOT NULL,
    `totalWealth` DECIMAL(15, 2) NOT NULL,
    `zakatAmount` DECIMAL(15, 2) NOT NULL,
    `contactPhone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    `paymentMarkedAt` DATETIME(3) NULL,
    `paymentScreenshotUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ZakatPayment_userId_idx`(`userId`),
    INDEX `ZakatPayment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- CreateTable
CREATE TABLE `ZakatApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `applicantName` VARCHAR(191) NOT NULL,
    `applicantPhone` VARCHAR(191) NOT NULL,
    `applicantCNIC` VARCHAR(191) NOT NULL,
    `applicantAddress` TEXT NOT NULL,
    `familyMembers` INTEGER NOT NULL,
    `monthlyIncome` DECIMAL(10, 2) NOT NULL,
    `employmentStatus` VARCHAR(191) NOT NULL,
    `housingStatus` VARCHAR(191) NOT NULL,
    `hasDisabledMembers` BOOLEAN NOT NULL,
    `disabilityDetails` TEXT NULL,
    `reasonForApplication` TEXT NOT NULL,
    `amountRequested` DECIMAL(10, 2) NULL,
    `additionalNotes` TEXT NULL,
    `cnicDocumentUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ZakatApplication_userId_idx`(`userId`),
    INDEX `ZakatApplication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AddForeignKey
ALTER TABLE `ZakatPayment` ADD CONSTRAINT `ZakatPayment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `ZakatApplication` ADD CONSTRAINT `ZakatApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
