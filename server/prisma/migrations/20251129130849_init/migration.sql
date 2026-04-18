-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `cnic` VARCHAR(191) NULL,
    `userType` ENUM('DONOR', 'BENEFICIARY', 'VOLUNTEER', 'ADMIN') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_cnic_key`(`cnic`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_userType_idx`(`userType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QurbaniDonation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `animalType` ENUM('GOAT', 'COW', 'CAMEL') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `donorAddress` TEXT NOT NULL,
    `deliveryDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QurbaniDonation_userId_idx`(`userId`),
    INDEX `QurbaniDonation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RationDonation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `donorEmail` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `rationItems` TEXT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RationDonation_userId_idx`(`userId`),
    INDEX `RationDonation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkinCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `donorPhone` VARCHAR(191) NOT NULL,
    `collectionAddress` TEXT NOT NULL,
    `numberOfSkins` INTEGER NOT NULL,
    `animalType` VARCHAR(191) NOT NULL,
    `preferredDate` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SkinCollection_userId_idx`(`userId`),
    INDEX `SkinCollection_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrphanSponsorship` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `sponsorName` VARCHAR(191) NOT NULL,
    `sponsorPhone` VARCHAR(191) NOT NULL,
    `sponsorEmail` VARCHAR(191) NOT NULL,
    `monthlyAmount` DECIMAL(10, 2) NOT NULL,
    `duration` INTEGER NOT NULL,
    `orphanAge` VARCHAR(191) NULL,
    `orphanGender` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrphanSponsorship_userId_idx`(`userId`),
    INDEX `OrphanSponsorship_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoanApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `loanType` ENUM('INTEREST_FREE', 'BUSINESS', 'EDUCATION', 'MEDICAL', 'HOUSING') NOT NULL,
    `requestedAmount` DECIMAL(10, 2) NOT NULL,
    `monthlyIncome` DECIMAL(10, 2) NOT NULL,
    `familyMembers` INTEGER NOT NULL,
    `employmentStatus` VARCHAR(191) NOT NULL,
    `purposeDescription` TEXT NOT NULL,
    `applicantName` VARCHAR(191) NOT NULL,
    `applicantPhone` VARCHAR(191) NOT NULL,
    `applicantCNIC` VARCHAR(191) NOT NULL,
    `applicantAddress` TEXT NOT NULL,
    `guarantorName` VARCHAR(191) NULL,
    `guarantorPhone` VARCHAR(191) NULL,
    `guarantorCNIC` VARCHAR(191) NULL,
    `guarantorAddress` TEXT NULL,
    `additionalNotes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LoanApplication_userId_idx`(`userId`),
    INDEX `LoanApplication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RamadanRationApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `familyMembers` INTEGER NOT NULL,
    `monthlyIncome` DECIMAL(10, 2) NOT NULL,
    `hasDisabledMembers` BOOLEAN NOT NULL,
    `disabilityDetails` TEXT NULL,
    `applicantName` VARCHAR(191) NOT NULL,
    `applicantPhone` VARCHAR(191) NOT NULL,
    `applicantCNIC` VARCHAR(191) NOT NULL,
    `applicantAddress` TEXT NOT NULL,
    `reasonForApplication` TEXT NOT NULL,
    `previouslyReceived` BOOLEAN NOT NULL,
    `additionalNotes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RamadanRationApplication_userId_idx`(`userId`),
    INDEX `RamadanRationApplication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrphanRegistration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `orphanName` VARCHAR(191) NOT NULL,
    `orphanAge` INTEGER NOT NULL,
    `orphanGender` VARCHAR(191) NOT NULL,
    `guardianRelation` VARCHAR(191) NOT NULL,
    `guardianName` VARCHAR(191) NOT NULL,
    `guardianPhone` VARCHAR(191) NOT NULL,
    `guardianCNIC` VARCHAR(191) NOT NULL,
    `guardianAddress` TEXT NOT NULL,
    `monthlyIncome` DECIMAL(10, 2) NOT NULL,
    `familyMembers` INTEGER NOT NULL,
    `educationLevel` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NULL,
    `healthCondition` TEXT NULL,
    `fatherStatus` VARCHAR(191) NOT NULL,
    `motherStatus` VARCHAR(191) NOT NULL,
    `additionalNotes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrphanRegistration_userId_idx`(`userId`),
    INDEX `OrphanRegistration_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VolunteerTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `volunteerName` VARCHAR(191) NOT NULL,
    `volunteerPhone` VARCHAR(191) NOT NULL,
    `volunteerEmail` VARCHAR(191) NOT NULL,
    `volunteerAddress` TEXT NOT NULL,
    `taskCategory` ENUM('DISTRIBUTION', 'FUNDRAISING', 'AWARENESS', 'ADMINISTRATIVE', 'FIELD_WORK', 'EVENT_SUPPORT') NOT NULL,
    `availability` VARCHAR(191) NOT NULL,
    `skills` TEXT NULL,
    `experience` TEXT NULL,
    `preferredLocation` VARCHAR(191) NULL,
    `emergencyContact` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VolunteerTask_userId_idx`(`userId`),
    INDEX `VolunteerTask_status_idx`(`status`),
    INDEX `VolunteerTask_taskCategory_idx`(`taskCategory`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sid_key`(`sid`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QurbaniDonation` ADD CONSTRAINT `QurbaniDonation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RationDonation` ADD CONSTRAINT `RationDonation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkinCollection` ADD CONSTRAINT `SkinCollection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrphanSponsorship` ADD CONSTRAINT `OrphanSponsorship_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RamadanRationApplication` ADD CONSTRAINT `RamadanRationApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrphanRegistration` ADD CONSTRAINT `OrphanRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerTask` ADD CONSTRAINT `VolunteerTask_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
