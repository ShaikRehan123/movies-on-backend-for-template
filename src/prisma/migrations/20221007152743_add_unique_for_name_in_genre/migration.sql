/*
  Warnings:

  - You are about to drop the `Genres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenresToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenresToSeries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_GenresToMovie` DROP FOREIGN KEY `_GenresToMovie_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GenresToMovie` DROP FOREIGN KEY `_GenresToMovie_B_fkey`;

-- DropForeignKey
ALTER TABLE `_GenresToSeries` DROP FOREIGN KEY `_GenresToSeries_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GenresToSeries` DROP FOREIGN KEY `_GenresToSeries_B_fkey`;

-- DropTable
DROP TABLE `Genres`;

-- DropTable
DROP TABLE `_GenresToMovie`;

-- DropTable
DROP TABLE `_GenresToSeries`;

-- CreateTable
CREATE TABLE `Genre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Genre_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GenreToSeries` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GenreToSeries_AB_unique`(`A`, `B`),
    INDEX `_GenreToSeries_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GenreToMovie` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GenreToMovie_AB_unique`(`A`, `B`),
    INDEX `_GenreToMovie_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GenreToSeries` ADD CONSTRAINT `_GenreToSeries_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenreToSeries` ADD CONSTRAINT `_GenreToSeries_B_fkey` FOREIGN KEY (`B`) REFERENCES `Series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenreToMovie` ADD CONSTRAINT `_GenreToMovie_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GenreToMovie` ADD CONSTRAINT `_GenreToMovie_B_fkey` FOREIGN KEY (`B`) REFERENCES `Movie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
