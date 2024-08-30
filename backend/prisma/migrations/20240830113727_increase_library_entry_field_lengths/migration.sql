-- AlterTable
ALTER TABLE `LibraryEntry` MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `imageUrl` TEXT NULL,
    MODIFY `synopsis` TEXT NULL,
    MODIFY `authors` TEXT NULL,
    MODIFY `genres` TEXT NULL;
