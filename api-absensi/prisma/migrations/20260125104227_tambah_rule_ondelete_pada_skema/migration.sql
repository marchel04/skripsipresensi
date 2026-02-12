-- DropForeignKey
ALTER TABLE `absensi` DROP FOREIGN KEY `absensi_id_pegawai_fkey`;

-- DropForeignKey
ALTER TABLE `izin` DROP FOREIGN KEY `izin_id_pegawai_fkey`;

-- DropIndex
DROP INDEX `izin_id_pegawai_fkey` ON `izin`;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id_pegawai`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `izin` ADD CONSTRAINT `izin_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id_pegawai`) ON DELETE CASCADE ON UPDATE CASCADE;
