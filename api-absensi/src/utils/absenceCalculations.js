// ==================== UTILITY UNTUK PERHITUNGAN ABSENSI ====================
// Fungsi-fungsi untuk menghitung jam terlambat, jam kerja, dan validasi presensi
// ===========================================================================

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Jakarta";

/**
 * Menghitung selisih menit antara dua waktu
 * @param {String} timeStart - Format HH:mm atau HH:mm:ss
 * @param {String} timeEnd - Format HH:mm atau HH:mm:ss
 * @returns {Number} Selisih dalam menit (negatif jika timeEnd < timeStart)
 */
const calculateMinuteDifference = (timeStart, timeEnd) => {
  // Handle format HH:mm:ss atau HH:mm
  const parseTime = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    const hour = parts[0];
    const minute = parts[1] || 0;
    return { hour, minute };
  };

  const start = parseTime(timeStart);
  const end = parseTime(timeEnd);

  const startTotalMin = start.hour * 60 + start.minute;
  const endTotalMin = end.hour * 60 + end.minute;

  return endTotalMin - startTotalMin;
};

/**
 * Menghitung jam terlambat berdasarkan batas masuk
 * Jam terlambat hanya dihitung jika waktu absensi melewati batas_masuk
 * @param {String} batasMasukSchedule - Batas masuk yang dijadwalkan (HH:mm)
 * @param {Date} jamMasukActual - Jam masuk aktual (DateTime)
 * @returns {Number} Menit terlambat (0 jika tepat waktu atau sebelum batas)
 */
const calculateLatenessMinutes = (batasMasukSchedule, jamMasukActual) => {
  // Konversi ke dayjs dengan timezone TZ
  const actualTime = dayjs(jamMasukActual).tz(TZ).format("HH:mm");
  const latenessMinutes = calculateMinuteDifference(batasMasukSchedule, actualTime);

  console.log(
    `[LATENESS_CALC] Batas Masuk: ${batasMasukSchedule}, Actual: ${actualTime}, Difference: ${latenessMinutes} minutes`
  );

  // Hanya return nilai lateness jika melewati batas (positif), jika tidak return 0
  return Math.max(0, latenessMinutes);
};

/**
 * Menghitung total jam kerja
 * @param {String} jamMasuk - Jam masuk dijadwalkan (HH:mm)
 * @param {String} jamPulang - Jam pulang dijadwalkan (HH:mm)
 * @param {Number} latenessMinutes - Menit terlambat
 * @returns {Number} Total jam kerja (desimal)
 */
const calculateWorkHours = (jamMasuk, jamPulang, latenessMinutes = 0) => {
  const durationMinutes = calculateMinuteDifference(jamMasuk, jamPulang);
  const actualWorkMinutes = Math.max(0, durationMinutes - latenessMinutes);

  return parseFloat((actualWorkMinutes / 60).toFixed(2));
};

/**
 * Konversi waktu ke desimal jam
 * @param {String} time - Format HH:mm
 * @returns {Number} Desimal jam
 */
const timeToDecimalHours = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return parseFloat((hours + minutes / 60).toFixed(2));
};

/**
 * Mendapatkan jadwal kerja pegawai
 * @param {Object} pegawai - Data pegawai dari database
 * @param {Object} jamKerja - Data jam kerja dari database
 * @returns {Object} {jam_masuk, jam_pulang, batas_masuk}
 */
const getWorkSchedule = (pegawai, jamKerja) => {
  return {
    jam_masuk: pegawai?.jam_masuk_custom || jamKerja?.jam_masuk,
    jam_pulang: pegawai?.jam_pulang_custom || jamKerja?.jam_pulang,
    batas_masuk: jamKerja?.batas_masuk,
  };
};

/**
 * Cek apakah pegawai terlambat
 * @param {String} jamMasukSchedule - Jam masuk dijadwalkan (HH:mm)
 * @param {String} jamMasukActual - Jam masuk aktual (HH:mm)
 * @returns {Boolean}
 */
const isLate = (jamMasukSchedule, jamMasukActual) => {
  const latenessMinutes = calculateMinuteDifference(jamMasukSchedule, jamMasukActual);
  return latenessMinutes > 0;
};

/**
 * Cek apakah jam masuk melebihi batas masuk
 * @param {String} jamMasukActual - Jam masuk aktual (HH:mm)
 * @param {String} batasMasuk - Batas jam masuk (HH:mm)
 * @returns {Boolean}
 */
const isExceedsDeadline = (jamMasukActual, batasMasuk) => {
  // If actual masuk is later than batasMasuk -> exceeds deadline
  const minutesDifference = calculateMinuteDifference(batasMasuk, jamMasukActual);
  return minutesDifference > 0;
};

/**
 * Format status absensi dengan warna (untuk display)
 * @param {String} status - Status absensi (hadir, terlambat, pulang_cepat, alfa)
 * @returns {Object} {label, color}
 */
const getStatusDisplay = (status) => {
  const statusMap = {
    hadir: { label: "Hadir", color: "green" },
    terlambat: { label: "Terlambat", color: "orange" },
    pulang_cepat: { label: "Pulang Cepat", color: "blue" },
    alfa: { label: "Alfa", color: "red" },
  };
  return statusMap[status] || { label: "Unknown", color: "gray" };
};

/**
 * Cek apakah sudah ada izin untuk hari ini (status apapun: pending, disetujui, ditolak)
 * @param {Number} idPegawai
 * @param {Date} tanggal
 * @param {PrismaClient} prisma
 * @returns {Promise<Boolean>}
 */
const checkIfAlreadyHasLeaveToday = async (idPegawai, tanggal, prisma) => {
  const today = dayjs(tanggal).tz(TZ).startOf("day");
  const tomorrow = today.add(1, "day");

  const izin = await prisma.izin.findFirst({
    where: {
      id_pegawai: idPegawai,
      tgl_mulai: {
        lte: tomorrow.toDate(),
      },
      tgl_selesai: {
        gte: today.toDate(),
      },
    },
  });

  return !!izin;
};

/**
 * Cek apakah sudah ada absensi untuk hari ini
 * @param {Number} idPegawai
 * @param {Date} tanggal
 * @param {PrismaClient} prisma
 * @returns {Promise<Boolean>}
 */
const checkIfAlreadyCheckedInToday = async (idPegawai, tanggal, prisma) => {
  const today = dayjs(tanggal).tz(TZ).startOf("day");
  const tomorrow = today.add(1, "day");

  const absensi = await prisma.absensi.findFirst({
    where: {
      id_pegawai: idPegawai,
      tgl_absensi: {
        gte: today.toDate(),
        lt: tomorrow.toDate(),
      },
    },
  });

  return !!absensi;
};

module.exports = {
  calculateMinuteDifference,
  calculateLatenessMinutes,
  calculateWorkHours,
  timeToDecimalHours,
  getWorkSchedule,
  isLate,
  isExceedsDeadline,
  getStatusDisplay,
  checkIfAlreadyHasLeaveToday,
  checkIfAlreadyCheckedInToday,
};
