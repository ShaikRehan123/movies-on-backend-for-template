-- DropForeignKey
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_paymentId_fkey`;

-- AlterTable
ALTER TABLE `Subscription` MODIFY `paymentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
