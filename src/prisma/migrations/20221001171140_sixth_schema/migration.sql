/*
  Warnings:

  - You are about to drop the column `genre` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Movie` DROP COLUMN `genre`;

-- AlterTable
ALTER TABLE `Seller` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Series` DROP COLUMN `genre`;

-- CreateTable
CREATE TABLE `Genres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GenresToSeries` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GenresToSeries_AB_unique`(`A`, `B`),
    INDEX `_GenresToSeries_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GenresToMovie` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GenresToMovie_AB_unique`(`A`, `B`),
    INDEX `_GenresToMovie_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GenresToSeries` ADD CONSTRAINT `_GenresToSeries_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenresToSeries` ADD CONSTRAINT `_GenresToSeries_B_fkey` FOREIGN KEY (`B`) REFERENCES `Series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenresToMovie` ADD CONSTRAINT `_GenresToMovie_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenresToMovie` ADD CONSTRAINT `_GenresToMovie_B_fkey` FOREIGN KEY (`B`) REFERENCES `Movie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
