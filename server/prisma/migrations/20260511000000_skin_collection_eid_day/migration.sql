-- AlterTable
ALTER TABLE `SkinCollection`
  MODIFY `preferredDate` DATETIME(3) NULL,
  ADD COLUMN `eidDay` VARCHAR(191) NULL;
