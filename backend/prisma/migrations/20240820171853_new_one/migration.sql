/*
  Warnings:

  - The values [ANIME] on the enum `LibraryEntry_itemType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Anime` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `LibraryEntry` MODIFY `itemType` ENUM('MANGA') NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `private` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Anime`;
