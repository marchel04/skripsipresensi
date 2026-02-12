const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const prisma = require("../utils/prisma");
const {
  calculateLatenessMinutes,
  calculateWorkHours,
  getWorkSchedule,
} = require("../utils/absenceCalculations");

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Jakarta";

/**
 * Helper: Get max of two dayjs objects
 */
const dayjsMax = (a, b) => {
  return a.isAfter(b) ? a : b;
};

/**
 * Helper: Get min of two dayjs objects
 */
const dayjsMin = (a, b) => {
  return a.isBefore(b) ? a : b;
};

const DashboardService = {
  /**
   * Ambil statistik dashboard admin
   * @returns {Object} {totalPegawai, totalHadir, totalTerlambat, totalIzin, totalJamKerja, rekapPerbulan}
   */
  getAdminDashboardStats: async function (tanggal = new Date()) {
    try {
      const year = dayjs(tanggal).tz(TZ).year();
      const month = dayjs(tanggal).tz(TZ).month() + 1;
      const today = dayjs(tanggal).tz(TZ).startOf("day");

      // Total pegawai
      const totalPegawai = await prisma.pegawai.count({
        where: { role: "pegawai" },
      });

      // Hari ini - hadir, terlambat, izin
      const todayAbsensi = await prisma.absensi.findMany({
        where: {
          tgl_absensi: {
            gte: today.toDate(),
            lt: today.add(1, "day").toDate(),
          },
        },
        include: { pegawai: true, jamKerja: true },
      });

      const totalHadir = todayAbsensi.filter((a) => a.status === "hadir").length;
      const totalTerlambat = todayAbsensi.filter(
        (a) => a.status === "terlambat"
      ).length;

      const todayIzin = await prisma.izin.count({
        where: {
          status_izin: "disetujui",
          tgl_mulai: { lte: today.toDate() },
          tgl_selesai: { gte: today.toDate() },
        },
      });

      const totalJamKerja = todayAbsensi.reduce(
        (acc, a) => acc + (parseFloat(a.total_jam_kerja) || 0),
        0
      );

      // Rekap perbulan - menggunakan rekap_prebulan atau hitung dari absensi
      const rekapPerbulan = await prisma.rekapPrebulan.findMany({
        where: {
          tahun: year,
          bulan: month,
        },
        include: {
          pegawai: true,
        },
      });

      return {
        totalPegawai,
        totalHadir,
        totalTerlambat,
        totalIzin: todayIzin,
        totalJamKerja: parseFloat(totalJamKerja.toFixed(2)),
        rekapPerbulan: rekapPerbulan || [],
      };
    } catch (error) {
      console.error("DashboardService.getAdminDashboardStats Error:", error.message);
      throw error;
    }
  },

  /**
   * Ambil data absensi dengan filter tanggal, jenis, dan rekap
   */
  getAbsensiReport: async function (filters = {}) {
    const { tanggal, bulan, tahun, pegawaiId } = filters;
    let whereClause = {};

    if (tanggal) {
      const dateStart = dayjs(tanggal).tz(TZ).startOf("day");
      whereClause.tgl_absensi = {
        gte: dateStart.toDate(),
        lt: dateStart.add(1, "day").toDate(),
      };
    } else if (bulan && tahun) {
      const monthStart = dayjs()
        .tz(TZ)
        .year(tahun)
        .month(bulan - 1)
        .startOf("month");
      whereClause.tgl_absensi = {
        gte: monthStart.toDate(),
        lt: monthStart.add(1, "month").toDate(),
      };
    }

    if (pegawaiId) {
      whereClause.id_pegawai = pegawaiId;
    }

    const absensi = await prisma.absensi.findMany({
      where: whereClause,
      include: {
        pegawai: true,
        jamKerja: true,
      },
      orderBy: [{ tgl_absensi: "desc" }, { id_pegawai: "asc" }],
    });

    // Hitung rekap per pegawai jika dengan bulan/tahun
    let recap = null;
    if (bulan && tahun && !pegawaiId) {
      const pegawaiMap = new Map();
      const monthStart = dayjs()
        .tz(TZ)
        .year(tahun)
        .month(bulan - 1)
        .startOf("month");
      const monthEnd = monthStart.endOf("month");

      absensi.forEach((a) => {
        if (!pegawaiMap.has(a.id_pegawai)) {
          pegawaiMap.set(a.id_pegawai, {
            id_pegawai: a.id_pegawai,
            nama: a.pegawai.nama_lengkap,
            totalHadir: 0,
            totalTerlambat: 0,
            totalTidakHadir: 0,
            totalJamKerja: 0,
            totalJamTerlambat: 0,
            totalIzin: 0,
            jamMasukDetails: [],
          });
        }

        const record = pegawaiMap.get(a.id_pegawai);
        if (a.status === "hadir") record.totalHadir++;
        if (a.status === "terlambat") record.totalTerlambat++;
        if (a.status === "alfa" || !a.status) record.totalTidakHadir++;

        // Debug logging
        console.log(`[Dashboard] Processing ${a.id_pegawai} - status: ${a.status}, jam_masuk: ${a.jam_masuk}, jam_pulang: ${a.jam_pulang}, jamKerja exists: ${!!a.jamKerja}`);

        // Prisma Decimal may be returned as Decimal object/string — coerce safely to number
        // Also handle legacy/alternate format where total_jam_kerja is stored as "HH:MM:SS"
        let storedTj = 0;
        const rawTj = a.total_jam_kerja ?? 0;
        const asNum = parseFloat(String(rawTj));
        if (!Number.isNaN(asNum) && asNum !== 0) {
          storedTj = asNum;
        } else {
          const s = String(rawTj || "");
          if (s.includes(":")) {
            const parts = s.split(":").map((p) => Number(p) || 0);
            const seconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
            storedTj = parseFloat((seconds / 3600).toFixed(2));
          } else {
            storedTj = Number(asNum || 0);
          }
        }
        const jt = Number(a.jam_terlambat ?? 0) || 0;

        // Prefer computing work time from actual timestamps when both jam_masuk and jam_pulang exist
        // IMPORTANT: Calculate full duration WITHOUT subtracting lateness - lateness tracked separately in totalJamTerlambat
        let tjComputed = storedTj;
        if (a.jam_masuk && a.jam_pulang) {
          try {
            const masuk = new Date(a.jam_masuk);
            const pulang = new Date(a.jam_pulang);
            const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
            tjComputed = parseFloat((durationSeconds / 3600).toFixed(4));
            console.log(`[Dashboard] Pegawai ${a.id_pegawai} pada ${new Date(a.tgl_absensi).toLocaleDateString()}: computed ${tjComputed} hours (${durationSeconds}s), terlambat=${jt} menit`);
          } catch (e) {
            let tjComputed = storedTj;
            console.error(`[Dashboard] Error computing work hours:`, e.message);
          }
        } else if (a.jam_masuk && !a.jam_pulang && a.jamKerja) {
          // Jika hanya ada jam_masuk, gunakan jam_pulang dari jamKerja untuk estimate
          try {
            const masuk = new Date(a.jam_masuk);
            // Parse jam_pulang dari jamKerja (e.g., "17:00")
                // Prefer stored DB value if it's larger than computed (handles tiny stored durations)
                if (storedTj > tjComputed) {
                  tjComputed = storedTj;
                }
                console.log(`[Dashboard] Pegawai ${a.id_pegawai} pada ${new Date(a.tgl_absensi).toLocaleDateString()}: computed ${tjComputed} hours (${durationSeconds}s), terlambat=${jt} menit`);
            const [hStr, mStr] = jamPulangStr.split(":").map(x => x.trim());
            const h = parseInt(hStr, 10) || 17;
            const m = parseInt(mStr, 10) || 0;
            
            // Create a pulang time on the same day
            const pulang = new Date(masuk);
            pulang.setHours(h, m, 0, 0);
            
            // If pulang is before masuk (e.g., late night shift), add 1 day
            if (pulang < masuk) {
              pulang.setDate(pulang.getDate() + 1);
            }
            
            // Calculate full duration WITHOUT subtracting lateness
            const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
            tjComputed = parseFloat((durationSeconds / 3600).toFixed(4));
            if (storedTj > tjComputed) {
              tjComputed = storedTj;
            }
            console.log(`[Dashboard] Pegawai ${a.id_pegawai} pada ${new Date(a.tgl_absensi).toLocaleDateString()}: estimated ${tjComputed} hours using jamKerja (${durationSeconds}s), terlambat=${jt} menit`);
          } catch (e) {
            tjComputed = storedTj;
            console.error(`[Dashboard] Error estimating work hours:`, e.message);
          }
        } else if (!a.jam_masuk && a.jamKerja && (a.status === 'hadir' || a.status === 'terlambat')) {
          // Jika tidak ada jam_masuk sama sekali, gunakan estimasi penuh dari jamKerja (jam_masuk ke jam_pulang)
          try {
            const jamMasukStr = String(a.jamKerja.jam_masuk || "08:00");
            const jamPulangStr = String(a.jamKerja.jam_pulang || "17:00");
            
            const [hMasuk, mMasuk] = jamMasukStr.split(":").map(x => x.trim());
            const [hPulang, mPulang] = jamPulangStr.split(":").map(x => x.trim());
            
            const masuk = new Date(new Date(a.tgl_absensi).toDateString());
            masuk.setHours(parseInt(hMasuk, 10) || 8, parseInt(mMasuk, 10) || 0, 0, 0);
            
            const pulang = new Date(new Date(a.tgl_absensi).toDateString());
            pulang.setHours(parseInt(hPulang, 10) || 17, parseInt(mPulang, 10) || 0, 0, 0);
            
            // If pulang is before masuk (e.g., late night shift), add 1 day
            if (pulang < masuk) {
              pulang.setDate(pulang.getDate() + 1);
            }
            
            const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
            tjComputed = parseFloat((durationSeconds / 3600).toFixed(4));
            if (storedTj > tjComputed) {
              tjComputed = storedTj;
            }
            console.log(`[Dashboard] Pegawai ${a.id_pegawai} pada ${new Date(a.tgl_absensi).toLocaleDateString()}: estimated full day ${tjComputed} hours (${durationSeconds}s), terlambat=${jt} menit`);
          } catch (e) {
            tjComputed = storedTj;
            console.error(`[Dashboard] Error estimating full day work hours:`, e.message);
          }
        } else {
          console.log(`[Dashboard] Pegawai ${a.id_pegawai} pada ${new Date(a.tgl_absensi).toLocaleDateString()}: No calculation possible, using stored=${storedTj}`);
        }

        record.totalJamKerja += tjComputed;
        record.totalJamTerlambat += jt;
        record.jamMasukDetails.push({
          tanggal: new Date(a.tgl_absensi).toLocaleDateString("id-ID"),
          jam_masuk: a.jam_masuk,
          jam_pulang: a.jam_pulang,
          jamMasuk: a.jam_masuk ? new Date(a.jam_masuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-",
          jamPulang: a.jam_pulang ? new Date(a.jam_pulang).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-",
          status: a.status || "Tidak Absen",
          jamTerlambat: jt,
          jamKerja: tjComputed.toFixed(2),
        });
      });

      // Fetch izin data untuk periode bulan/tahun yang sama
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

      // Fetch default JamKerja untuk perhitungan izin
      const defaultJamKerja = await prisma.jamKerja.findFirst();

      // Helper function untuk hitung selisih jam_masuk dan batas_masuk
      const calculateMinutesBetween = (jamMasuk, batasMasuk) => {
        if (!jamMasuk || !batasMasuk) return 0;
        try {
          const jm = dayjs(`2000-01-01 ${jamMasuk}`, 'YYYY-MM-DD HH:mm');
          const bm = dayjs(`2000-01-01 ${batasMasuk}`, 'YYYY-MM-DD HH:mm');
          const minutes = Math.max(0, bm.diff(jm, 'minute'));
          return minutes / 60; // convert ke jam (decimal)
        } catch (e) {
          console.error('[Dashboard] Error in calculateMinutesBetween:', e.message);
          return 0;
        }
      };

      // Group absensi by pegawai for easy lookup during izin processing
      const absensiByPegawai = new Map();
      absensi.forEach((a) => {
        if (!absensiByPegawai.has(a.id_pegawai)) {
          absensiByPegawai.set(a.id_pegawai, []);
        }
        absensiByPegawai.get(a.id_pegawai).push(a);
      });

      // Count izin per pegawai and calculate work hours for leave days
      const izinCountByPegawai = {};
      const izinHoursByPegawai = {};
      
      izinData.forEach((izin) => {
        try {
          const pegawaiId = izin.id_pegawai;
          
          // Count izin occurrences
          izinCountByPegawai[pegawaiId] = (izinCountByPegawai[pegawaiId] || 0) + 1;
          
          const tglMulai = new Date(izin.tgl_mulai);
          const tglSelesai = new Date(izin.tgl_selesai);
          
          // Hitung total jam kerja untuk izin berdasarkan selisih jam_masuk dan batas_masuk
          // Sama seperti di absensi.service untuk konsistensi
          let totalJamKerjaPerHari = 0;
          if (defaultJamKerja) {
            const jamMasuk = izin.pegawai?.jam_masuk_custom || defaultJamKerja.jam_masuk;
            const batasMasuk = defaultJamKerja.batas_masuk;
            totalJamKerjaPerHari = calculateMinutesBetween(jamMasuk, batasMasuk);
          }
          
          // Hitung jumlah hari izin dalam periode bulan
          let jumlahHariIzin = 0;
          for (let d = new Date(tglMulai); d <= tglSelesai; d.setDate(d.getDate() + 1)) {
            const curDate = new Date(d);
            // Hanya hitung hari yang ada dalam month range
            if (curDate >= monthStart.toDate() && curDate <= monthEnd.toDate()) {
              jumlahHariIzin++;
            }
          }
          
          // Total jam kerja untuk seluruh periode izin
          const izinPeriodHours = totalJamKerjaPerHari * jumlahHariIzin;
          
          if (!izinHoursByPegawai[pegawaiId]) {
            izinHoursByPegawai[pegawaiId] = 0;
          }
          izinHoursByPegawai[pegawaiId] += izinPeriodHours;
          
          console.log(`[Dashboard] Pegawai ${pegawaiId} - Izin: ${jumlahHariIzin} days × ${totalJamKerjaPerHari.toFixed(4)} hours/day = ${izinPeriodHours.toFixed(4)} hours`);
        } catch (err) {
          console.error(`[Dashboard] Error processing izin:`, err.message);
          console.error(err);
        }
      });

      // Ensure pegawai who only have izin (no absensi rows) are included in recap
      const izinPegawaiIds = Object.keys(izinCountByPegawai).map((id) => Number(id));
      if (izinPegawaiIds.length > 0) {
        const pegawaiRows = await prisma.pegawai.findMany({
          where: { id_pegawai: { in: izinPegawaiIds } },
          select: { id_pegawai: true, nama_lengkap: true },
        });

        pegawaiRows.forEach((p) => {
          if (!pegawaiMap.has(p.id_pegawai)) {
            pegawaiMap.set(p.id_pegawai, {
              id_pegawai: p.id_pegawai,
              nama: p.nama_lengkap,
              totalHadir: 0,
              totalTerlambat: 0,
              totalTidakHadir: 0,
              totalJamKerja: 0,
              totalJamTerlambat: 0,
              totalIzin: 0,
              jamMasukDetails: [],
            });
          }
        });
      }

      // Update recap with totalIzin and add work hours from leave days
      pegawaiMap.forEach((record) => {
        record.totalIzin = izinCountByPegawai[record.id_pegawai] || 0;
        // Add work hours from leave periods
        const izinHours = izinHoursByPegawai[record.id_pegawai] || 0;
        record.totalJamKerja += izinHours;
        
        console.log(`[Dashboard Recap] Pegawai ${record.id_pegawai} (${record.nama}): totalJamKerja=${record.totalJamKerja}, izinHours=${izinHours}, totalIzin=${record.totalIzin}`);
      });

      // Normalize recap: ensure all numeric fields are JS numbers (not strings/Decimal objects)
      // Use 4 decimal precision for consistency with calculation logic
      recap = Array.from(pegawaiMap.values()).map((r) => ({
        ...r,
        totalHadir: Number(r.totalHadir || 0),
        totalTerlambat: Number(r.totalTerlambat || 0),
        totalTidakHadir: Number(r.totalTidakHadir || 0),
        totalIzin: Number(r.totalIzin || 0),
        totalJamKerja: Number(Number(r.totalJamKerja || 0).toFixed(4)),
        totalJamTerlambat: Number(r.totalJamTerlambat || 0),
      }));

      console.log(`[Dashboard] Month: ${bulan}/${tahun}, Generated ${recap.length} recap records`);
      
      // Log summary
      recap.forEach((r) => {
        console.log(`[Dashboard Summary] ${r.nama}: hadir=${r.totalHadir}, terlambat=${r.totalTerlambat}, izin=${r.totalIzin}, jamKerja=${r.totalJamKerja}`);
      });

      // Optional debug logging to help diagnose totals (enable by setting DEBUG_REKAP=1)
      if (process.env.DEBUG_REKAP === "1") {
        console.debug("[DEBUG_REKAP] Generated recap for period:", monthStart.format(), "-", monthEnd.format());
        recap.forEach((r) => {
          console.debug("[DEBUG_REKAP]", {
            id_pegawai: r.id_pegawai,
            nama: r.nama,
            totalHadir: r.totalHadir,
            totalTerlambat: r.totalTerlambat,
            totalIzin: r.totalIzin,
            totalJamKerja: r.totalJamKerja,
            totalJamTerlambat: r.totalJamTerlambat,
          });
        });
      }
    }

    return {
      data: absensi,
      recap,
      count: absensi.length,
    };
  },
};

module.exports = DashboardService;
