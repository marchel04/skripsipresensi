const prisma = require("./prisma");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = "Asia/Jayapura";

const checkTerlambat = async (id_jam, jam_masuk) => {
  const jamKerja = await prisma.jamKerja.findUnique({
    where: { id_jam: Number(id_jam) },
    select: { batas_masuk: true },
  });

  if (!jamKerja) {
    throw new Error("Jam kerja tidak ditemukan");
  }

  // jam masuk actual (datetime)
  const jamMasuk = dayjs(jam_masuk).tz(APP_TZ);

  // ambil tanggal dari jam masuk
  const tanggal = jamMasuk.format("YYYY-MM-DD");

  // batas masuk digabung dengan tanggal jam masuk
  const batasMasuk = dayjs.tz(
    `${tanggal} ${jamKerja.batas_masuk}`,
    "YYYY-MM-DD HH:mm:ss",
    APP_TZ
  );

  return {
    terlambat: jamMasuk.isAfter(batasMasuk),
  };
};

const checkPulangCepat = async (id_pegawai, jam_pulang) => {
  const startDay = dayjs().tz(APP_TZ).startOf("day").utc().toDate();
  const endDay = dayjs().tz(APP_TZ).endOf("day").utc().toDate();

  const absensi = await prisma.absensi.findFirst({
    where: {
      id_pegawai: Number(id_pegawai),
      tgl_absensi: {
        gte: startDay,
        lte: endDay,
      },
    },
    include: {
      jamKerja: {
        select: { jam_pulang: true },
      },
    },
  });

  if (!absensi) {
    throw new Error("Absensi hari ini tidak ditemukan");
  }

  if (!absensi.jamKerja?.jam_pulang) {
    throw new Error("Jam pulang pada jam kerja belum diset");
  }

  const jamPulang = dayjs(jam_pulang).tz(APP_TZ);
  // const jamPulang = dayjs.utc(jam_pulang).tz(APP_TZ);
  const tanggal = jamPulang.format("YYYY-MM-DD");

  const batasPulang = dayjs.tz(
    `${tanggal} ${absensi.jamKerja.jam_pulang}`,
    ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"],
    APP_TZ
  );

  console.log("Jam Pulang WIT:", jamPulang.format());
  console.log("Batas Pulang:", batasPulang.format());

  return {
    pulangCepat: jamPulang.isBefore(batasPulang),
  };
};


module.exports = { checkTerlambat, checkPulangCepat };
