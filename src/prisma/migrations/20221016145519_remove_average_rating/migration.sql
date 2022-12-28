/*
  Warnings:

  - You are about to drop the column `averageRating` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `averageRating` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Movie` DROP COLUMN `averageRating`;

-- AlterTable
ALTER TABLE `Series` DROP COLUMN `averageRating`;
