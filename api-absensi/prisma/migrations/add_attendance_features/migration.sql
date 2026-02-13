-- Tambahkan kolom pada tabel absensi
ALTER TABLE `absensi` 
ADD COLUMN `jam_terlambat` INT DEFAULT 0 AFTER `id_jam`,
ADD COLUMN `total_jam_kerja` DECIMAL(5, 2) DEFAULT 0.00 AFTER `jam_terlambat`,
ADD COLUMN `sudah_izin_hari_ini` BOOLEAN DEFAULT false AFTER `total_jam_kerja`;

-- Tambahkan kolom pada tabel pegawai
ALTER TABLE `pegawai`
ADD COLUMN `jam_masuk_custom` TIME NULL AFTER `role`,
ADD COLUMN `jam_pulang_custom` TIME NULL AFTER `jam_masuk_custom`;

-- Create tabel rekap_prebulan
CREATE TABLE IF NOT EXISTS `rekap_prebulan` (
  `id_rekap` INT AUTO_INCREMENT PRIMARY KEY,
  `id_pegawai` INT NOT NULL,
  `tahun` INT NOT NULL,
  `bulan` INT NOT NULL,
  `total_hadir` INT DEFAULT 0,
  `total_terlambat` INT DEFAULT 0,
  `total_izin` INT DEFAULT 0,
  `total_alfa` INT DEFAULT 0,
  `total_jam_kerja` DECIMAL(8, 2) DEFAULT 0.00,
  `total_jam_terlambat` INT DEFAULT 0,
  UNIQUE KEY `unique_rekap` (`id_pegawai`, `tahun`, `bulan`),
  FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id_pegawai`) ON DELETE CASCADE
);

-- Tambahkan index untuk performance
CREATE INDEX `idx_pegawai_tanggal` ON `absensi`(`id_pegawai`, `tgl_absensi`);
CREATE INDEX `idx_status` ON `absensi`(`status`);
