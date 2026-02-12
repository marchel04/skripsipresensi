const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();
const APP_TZ = "Asia/Jayapura";

async function main() {
    console.log("🌱 Seeding database absensi (FINAL & CONSISTENT)...");

    /* =====================================================
     * 1. DIVISI
     * ===================================================== */
    const divisiIT = await prisma.divisi.upsert({
        where: { id_divisi: 1 },
        update: {},
        create: {
            nama_divisi: "IT",
        },
    });

    /* =====================================================
     * 2. JAM KERJA (STRING TIME ONLY)
     * ===================================================== */
    const jamKerjaDefault = await prisma.jamKerja.upsert({
        where: { id_jam: 1 },
        update: {},
        create: {
            nama_jam: "Jam Normal",
            jam_masuk: "08:00",
            batas_masuk: "08:15",
            jam_pulang: "17:00",
        },
    });

    /* =====================================================
     * 3. PEGAWAI (ADMIN)
     * ===================================================== */
    const adminPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.pegawai.upsert({
        where: { nip: "100001" },
        update: {},
        create: {
            nip: "100001",
            nama_lengkap: "Admin Sistem",
            jenis_kelamin: "Laki-laki",
            tgl_lahir: new Date("1990-01-01"),
            jabatan: "Administrator",
            id_divisi: divisiIT.id_divisi,
            no_telepon: "081111111111",
            password: adminPassword,
            role: "admin",
        },
    });

    await prisma.login.upsert({
        where: { nip: admin.nip },
        update: {},
        create: {
            nip: admin.nip,
            password: adminPassword,
        },
    });

    /* =====================================================
     * 4. PEGAWAI (USER)
     * ===================================================== */
    const pegawaiPassword = await bcrypt.hash("pegawai123", 10);

    const pegawai = await prisma.pegawai.upsert({
        where: { nip: "100002" },
        update: {},
        create: {
            nip: "100002",
            nama_lengkap: "Budi Santoso",
            jenis_kelamin: "Laki-laki",
            tgl_lahir: new Date("1995-05-10"),
            jabatan: "Staff IT",
            id_divisi: divisiIT.id_divisi,
            no_telepon: "082222222222",
            password: pegawaiPassword,
            role: "pegawai",
        },
    });

    await prisma.login.upsert({
        where: { nip: pegawai.nip },
        update: {},
        create: {
            nip: pegawai.nip,
            password: pegawaiPassword,
        },
    });

    /* =====================================================
     * 5. ABSENSI (FULL DATETIME – UTC)
     * ===================================================== */
    const todayWIT = dayjs().tz(APP_TZ).format("YYYY-MM-DD");

    await prisma.absensi.upsert({
        where: { id_absensi: 1 },
        update: {},
        create: {
            id_pegawai: pegawai.id_pegawai,
            jam_masuk: dayjs.tz(`${todayWIT} 08:05`, APP_TZ).utc().toDate(),
            jam_pulang: dayjs.tz(`${todayWIT} 17:00`, APP_TZ).utc().toDate(),
            status: "hadir",
            id_jam: jamKerjaDefault.id_jam,
        },
    });

    /* =====================================================
     * 6. IZIN
     * ===================================================== */
    await prisma.izin.create({
        data: {
            id_pegawai: pegawai.id_pegawai,
            tgl_mulai: dayjs.tz("2025-01-10 00:00", APP_TZ).utc().toDate(),
            tgl_selesai: dayjs.tz("2025-01-12 23:59", APP_TZ).utc().toDate(),
            alasan: "Keperluan keluarga",
            status_izin: "pending",
        },
    });

    console.log("✅ Seeding selesai (SCHEMA-CORRECT & TZ-SAFE)");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
