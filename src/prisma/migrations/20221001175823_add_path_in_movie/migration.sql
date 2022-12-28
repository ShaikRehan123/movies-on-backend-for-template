/*
  Warnings:

  - Added the required column `uploadPath` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Movie` ADD COLUMN `uploadPath` VARCHAR(191) NOT NULL;
