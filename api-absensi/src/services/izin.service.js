const prisma = require("../utils/prisma.js");
const dayjs = require("dayjs");

const TZ = "Asia/Jakarta";

const IzinService = {
  getAllIzinService: async function () {
    return await prisma.izin.findMany({
      orderBy: { id_pegawai: "asc" },
      include: { pegawai: true },
    });
  },

  getIzinServiceById: async function (id) {
    return await prisma.izin.findUnique({
      where: { id_izin: Number(id) },
      include: { pegawai: true },
    });
  },

  getIzinByPegawaiService: async function (id_pegawai) {
    return await prisma.izin.findMany({
      where: {
        id_pegawai: Number(id_pegawai),
      },
      include: {
        pegawai: true,
      },
      orderBy: {
        tgl_mulai: "desc",
      },
    });
  },

  /**
   * Cari izin dengan filter tanggal dan status
   * @param {Object} filters - {tanggalMulai, tanggalSelesai, status, pegawaiId}
   */
  searchIzinService: async function (filters = {}) {
    const { tanggalMulai, tanggalSelesai, status, pegawaiId } = filters;
    let whereClause = {};

    if (tanggalMulai && tanggalSelesai) {
      const startDate = dayjs(tanggalMulai).tz(TZ).startOf("day");
      const endDate = dayjs(tanggalSelesai).tz(TZ).endOf("day");

      whereClause.AND = [
        {
          tgl_mulai: {
            lte: endDate.toDate(),
          },
        },
        {
          tgl_selesai: {
            gte: startDate.toDate(),
          },
        },
      ];
    }

    if (status) {
      whereClause.status_izin = status;
    }

    if (pegawaiId) {
      whereClause.id_pegawai = pegawaiId;
    }

    return await prisma.izin.findMany({
      where: whereClause,
      include: { pegawai: true },
      orderBy: { tgl_mulai: "desc" },
    });
  },

  /**
   * Ambil rekap izin per pegawai berdasarkan periode
   */
  getIzinRecapService: async function (bulan, tahun) {
    const monthStart = dayjs()
      .tz(TZ)
      .year(tahun)
      .month(bulan - 1)
      .startOf("month");
    const monthEnd = monthStart.endOf("month");

    const izinData = await prisma.izin.findMany({
      where: {
        status_izin: "disetujui",
        tgl_mulai: {
          lte: monthEnd.toDate(),
        },
        tgl_selesai: {
          gte: monthStart.toDate(),
        },
      },
      include: { pegawai: true },
    });

    // Hitung rekap per pegawai
    const rekap = new Map();

    izinData.forEach((izin) => {
      if (!rekap.has(izin.id_pegawai)) {
        rekap.set(izin.id_pegawai, {
          id_pegawai: izin.id_pegawai,
          nama: izin.pegawai.nama_lengkap,
          totalIzin: 0,
          listIzin: [],
        });
      }

      const record = rekap.get(izin.id_pegawai);
      const days = dayjs(izin.tgl_selesai).diff(dayjs(izin.tgl_mulai), "day") + 1;
      record.totalIzin += days;
      record.listIzin.push({
        tanggal_mulai: dayjs(izin.tgl_mulai).tz(TZ).format("YYYY-MM-DD"),
        tanggal_selesai: dayjs(izin.tgl_selesai).tz(TZ).format("YYYY-MM-DD"),
        alasan: izin.alasan,
        durasi_hari: days,
      });
    });

    return Array.from(rekap.values());
  },

  createIzinService: async function (data) {
    // Check apakah sudah ada absensi pada tanggal izin
    const tglMulai = dayjs(data.tgl_mulai).tz(TZ).startOf("day").toDate();
    const tglSelesai = dayjs(data.tgl_selesai).tz(TZ).endOf("day").toDate();

    const sudahAbsen = await prisma.absensi.findFirst({
      where: {
        id_pegawai: data.id_pegawai,
        tgl_absensi: {
          gte: tglMulai,
          lte: tglSelesai,
        },
      },
    });

    if (sudahAbsen) {
      throw new Error(
        "Tidak dapat membuat izin karena Anda sudah melakukan presensi pada tanggal izin tersebut"
      );
    }

    return await prisma.izin.create({
      data: {
        tgl_mulai: data.tgl_mulai,
        tgl_selesai: data.tgl_selesai,
        alasan: data.alasan,
        filepath: data.filepath ?? null,

        pegawai: {
          connect: {
            id_pegawai: data.id_pegawai,
          },
        },
      },
    });
  },

  updateIzinService: async function (id, data) {
    return await prisma.izin.update({
      where: { id_izin: Number(id) },
      data,
      include: { pegawai: true },
    });
  },

  deleteIzinService: async function (id) {
    return await prisma.izin.delete({
      where: { id_izin: Number(id) },
    });
  },

  /**
   * Ambil izin pegawai untuk hari ini (status apapun: pending, disetujui, ditolak)
   * @param {Number} id_pegawai
   * @returns {Promise<Object|null>} Izin hari ini atau null
   */
  getIzinTodayService: async function (id_pegawai) {
    const today = dayjs().tz(TZ).startOf("day");
    const tomorrow = today.add(1, "day");

    const izin = await prisma.izin.findFirst({
      where: {
        id_pegawai: Number(id_pegawai),
        tgl_mulai: {
          lte: tomorrow.toDate(),
        },
        tgl_selesai: {
          gte: today.toDate(),
        },
      },
      include: { pegawai: true },
    });

    return izin || null;
  },
};

module.exports = IzinService;

