-- CreateTable
CREATE TABLE `Fitrana` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `numberOfPeople` INTEGER NOT NULL,
    `calculationBasis` VARCHAR(191) NOT NULL,
    `amountPerPerson` DECIMAL(10, 2) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `contactPhone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `paymentMarked` BOOLEAN NOT NULL DEFAULT false,
    `paymentMarkedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Fitrana_userId_idx`(`userId`),
    INDEX `Fitrana_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Fitrana` ADD CONSTRAINT `Fitrana_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
