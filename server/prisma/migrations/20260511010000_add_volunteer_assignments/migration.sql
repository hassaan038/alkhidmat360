-- CreateTable
CREATE TABLE `VolunteerAssignment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `volunteerId` INT NOT NULL,
  `assignedById` INT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM('DISTRIBUTION', 'FUNDRAISING', 'AWARENESS', 'ADMINISTRATIVE', 'FIELD_WORK', 'EVENT_SUPPORT') NOT NULL,
  `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
  `location` VARCHAR(191) NULL,
  `dueDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'assigned',
  `startedAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `completionNotes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `VolunteerAssignment_volunteerId_idx`(`volunteerId`),
  INDEX `VolunteerAssignment_assignedById_idx`(`assignedById`),
  INDEX `VolunteerAssignment_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VolunteerAssignment`
  ADD CONSTRAINT `VolunteerAssignment_volunteerId_fkey`
  FOREIGN KEY (`volunteerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerAssignment`
  ADD CONSTRAINT `VolunteerAssignment_assignedById_fkey`
  FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
