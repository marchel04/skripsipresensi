-- AlterTable
ALTER TABLE `absensi` ADD COLUMN `status_pulang` ENUM('hadir', 'terlambat', 'pulang_cepat', 'alfa') NULL,
    MODIFY `status` ENUM('hadir', 'terlambat', 'pulang_cepat', 'alfa') NULL;
