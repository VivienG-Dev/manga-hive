/*
  Warnings:

  - You are about to drop the column `score` on the `LibraryEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LibraryEntry` DROP COLUMN `score`,
    ADD COLUMN `chaptersProgress` INTEGER NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `userScore` INTEGER NULL,
    ADD COLUMN `volumesProgress` INTEGER NULL;
