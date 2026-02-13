/*
  Warnings:

  - You are about to alter the column `jam_masuk` on the `absensi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `jam_pulang` on the `absensi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `jam_masuk` on the `jam_kerja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `batas_masuk` on the `jam_kerja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `jam_pulang` on the `jam_kerja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `absensi` MODIFY `tgl_absensi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `jam_masuk` DATETIME(3) NULL,
    MODIFY `jam_pulang` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `jam_kerja` MODIFY `jam_masuk` DATETIME(3) NULL,
    MODIFY `batas_masuk` DATETIME(3) NULL,
    MODIFY `jam_pulang` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `absensi_id_pegawai_tgl_absensi_idx` ON `absensi`(`id_pegawai`, `tgl_absensi`);
