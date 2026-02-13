-- CreateTable
CREATE TABLE `pegawai` (
    `id_pegawai` INTEGER NOT NULL AUTO_INCREMENT,
    `nip` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `tgl_lahir` DATETIME(3) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `id_divisi` INTEGER NOT NULL,
    `no_telepon` VARCHAR(191) NOT NULL,
    `foto_profil` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'pegawai') NOT NULL DEFAULT 'pegawai',

    UNIQUE INDEX `pegawai_nip_key`(`nip`),
    PRIMARY KEY (`id_pegawai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login` (
    `nip` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`nip`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `divisi` (
    `id_divisi` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_divisi` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_divisi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jam_kerja` (
    `id_jam` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jam` VARCHAR(191) NOT NULL,
    `jam_masuk` DATETIME(3) NOT NULL,
    `batas_masuk` DATETIME(3) NOT NULL,
    `jam_pulang` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_jam`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id_absensi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pegawai` INTEGER NOT NULL,
    `tgl_absensi` DATETIME(3) NOT NULL,
    `jam_masuk` DATETIME(3) NULL,
    `jam_pulang` DATETIME(3) NULL,
    `status` ENUM('hadir', 'terlambat', 'pulang_cepat', 'alfa') NOT NULL,
    `id_jam` INTEGER NOT NULL,

    PRIMARY KEY (`id_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `izin` (
    `id_izin` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pegawai` INTEGER NOT NULL,
    `tgl_mulai` DATETIME(3) NOT NULL,
    `tgl_selesai` DATETIME(3) NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `status_izin` ENUM('pending', 'disetujui', 'ditolak') NOT NULL DEFAULT 'pending',

    PRIMARY KEY (`id_izin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hari` (
    `id_hari` INTEGER NOT NULL AUTO_INCREMENT,
    `nik` VARCHAR(191) NOT NULL,
    `hari` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_hari`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `divisi`(`id_divisi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login` ADD CONSTRAINT `login_nip_fkey` FOREIGN KEY (`nip`) REFERENCES `pegawai`(`nip`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id_pegawai`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_id_jam_fkey` FOREIGN KEY (`id_jam`) REFERENCES `jam_kerja`(`id_jam`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `izin` ADD CONSTRAINT `izin_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id_pegawai`) ON DELETE RESTRICT ON UPDATE CASCADE;
