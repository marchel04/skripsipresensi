const prisma = require("../utils/prisma");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

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

/**
 * Helper: Calculate selisih jam_masuk dan batas_masuk (dalam jam decimal)
 */
const calculateMinutesBetween = (jamMasuk, batasMasuk) => {
  if (!jamMasuk || !batasMasuk) return 0;
  try {
    const jm = dayjs(`2000-01-01 ${jamMasuk}`, 'YYYY-MM-DD HH:mm');
    const bm = dayjs(`2000-01-01 ${batasMasuk}`, 'YYYY-MM-DD HH:mm');
    const minutes = Math.max(0, bm.diff(jm, 'minute'));
    return minutes / 60; // convert ke jam (decimal)
  } catch (e) {
    console.warn(`[calculateMinutesBetween] Error parsing times: ${jamMasuk}, ${batasMasuk}`, e.message);
    return 0;
  }
};

async function getRekapBulanan(start, end) {
  try {
    console.log(`[getRekapBulanan] Params - start: ${start.toISOString()}, end: ${end.toISOString()}`);
    
    // Fetch default jamKerja for batas_masuk
    const defaultJamKerja = await prisma.jamKerja.findFirst();
    
    // Fetch all pegawai (not admin)
    const pegawaiList = await prisma.pegawai.findMany({
      where: { role: { not: 'admin' } },
      include: { 
        absensi: {
          where: {
            tgl_absensi: { gte: start, lt: end },
          },
        },
      },
    });

    // For each pegawai, compute stats for the period
    const result = await Promise.all(
      pegawaiList.map(async (p) => {
        // Fetch absensi for this pegawai in the period
        const absensiRows = await prisma.absensi.findMany({
          where: {
            id_pegawai: p.id_pegawai,
            tgl_absensi: { gte: start, lt: end },
          },
          include: { jamKerja: true },
        });

        // Fetch izin (disetujui) for this pegawai in the period
        const izinData = await prisma.izin.findMany({
          where: {
            id_pegawai: p.id_pegawai,
            status_izin: 'disetujui',
            tgl_mulai: { lte: end },
            tgl_selesai: { gte: start },
          },
        });

        // Compute aggregates
        let hadir = 0;
        let terlambat = 0;
        let pulang_cepat = 0;
        let tanpa_keterangan = 0;
        let totalDetikKerja = 0;
        let totalMenitTerlambat = 0;
        let countHariKerja = 0;

        absensiRows.forEach((a) => {
          if (a.status === 'hadir') hadir++;
          if (a.status === 'terlambat') terlambat++;
          if (a.status_pulang === 'pulang_cepat') pulang_cepat++;
          if (a.status === 'alfa') tanpa_keterangan++;

          const jt = Number(a.jam_terlambat ?? 0) || 0;
          totalMenitTerlambat += jt;

          if (a.jam_masuk && a.jam_pulang) {
            const masuk = new Date(a.jam_masuk);
            const pulang = new Date(a.jam_pulang);
            // IMPORTANT: Calculate full duration WITHOUT subtracting lateness - lateness tracked separately in totalMenitTerlambat
            let durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
            // If computed duration is zero but DB stored total_jam_kerja exists (e.g., "00:00:13"), prefer stored value
            if (durationSeconds === 0 && a.total_jam_kerja) {
              try {
                const raw = String(a.total_jam_kerja || "");
                if (raw.includes(":")) {
                  const parts = raw.split(":").map(p => Number(p) || 0);
                  const storedSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                  if (storedSeconds > 0) durationSeconds = storedSeconds;
                } else {
                  const asNum = parseFloat(raw);
                  if (!Number.isNaN(asNum) && asNum > 0) durationSeconds = Math.round(asNum * 3600);
                }
              } catch (e) {
                // ignore parse errors
              }
            }
            totalDetikKerja += durationSeconds;
            countHariKerja += 1;
          } else if (a.jam_masuk && !a.jam_pulang && a.jamKerja) {
            // Estimate with jam_pulang from jamKerja
            try {
              const masuk = new Date(a.jam_masuk);
              const jamPulangStr = String(a.jamKerja.jam_pulang || "17:00");
              const [hStr, mStr] = jamPulangStr.split(":").map(x => x.trim());
              const h = parseInt(hStr, 10) || 17;
              const m = parseInt(mStr, 10) || 0;
              
              const pulang = new Date(masuk);
              pulang.setHours(h, m, 0, 0);
              if (pulang < masuk) pulang.setDate(pulang.getDate() + 1);
              
              let durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
              if (durationSeconds === 0 && a.total_jam_kerja) {
                try {
                  const raw = String(a.total_jam_kerja || "");
                  if (raw.includes(":")) {
                    const parts = raw.split(":").map(p => Number(p) || 0);
                    const storedSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                    if (storedSeconds > 0) durationSeconds = storedSeconds;
                  } else {
                    const asNum = parseFloat(raw);
                    if (!Number.isNaN(asNum) && asNum > 0) durationSeconds = Math.round(asNum * 3600);
                  }
                } catch (e) {}
              }
              totalDetikKerja += durationSeconds;
              countHariKerja += 1;
            } catch (e) {
              console.warn(`[getRekapBulanan] Error estimating work hours for pegawai ${p.id_pegawai}:`, e.message);
            }
          } else if (!a.jam_masuk && a.jamKerja && (a.status === 'hadir' || a.status === 'terlambat')) {
            // Estimate full day from jamKerja
            try {
              const jamMasukStr = String(a.jamKerja.jam_masuk || "08:00");
              const jamPulangStr = String(a.jamKerja.jam_pulang || "17:00");
              
              const [hMasuk, mMasuk] = jamMasukStr.split(":").map(x => x.trim());
              const [hPulang, mPulang] = jamPulangStr.split(":").map(x => x.trim());
              
              const masuk = new Date(new Date(a.tgl_absensi).toDateString());
              masuk.setHours(parseInt(hMasuk, 10) || 8, parseInt(mMasuk, 10) || 0, 0, 0);
              
              const pulang = new Date(new Date(a.tgl_absensi).toDateString());
              pulang.setHours(parseInt(hPulang, 10) || 17, parseInt(mPulang, 10) || 0, 0, 0);
              if (pulang < masuk) pulang.setDate(pulang.getDate() + 1);
              
              let durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
              if (durationSeconds === 0 && a.total_jam_kerja) {
                try {
                  const raw = String(a.total_jam_kerja || "");
                  if (raw.includes(":")) {
                    const parts = raw.split(":").map(p => Number(p) || 0);
                    const storedSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                    if (storedSeconds > 0) durationSeconds = storedSeconds;
                  } else {
                    const asNum = parseFloat(raw);
                    if (!Number.isNaN(asNum) && asNum > 0) durationSeconds = Math.round(asNum * 3600);
                  }
                } catch (e) {}
              }
              totalDetikKerja += durationSeconds;
              countHariKerja += 1;
            } catch (e) {
              console.warn(`[getRekapBulanan] Error estimating full day for pegawai ${p.id_pegawai}:`, e.message);
            }
          }
        });

        // Calculate work hours for approved leave days
        // Formula: (batas_masuk - jam_masuk) × number_of_days_in_month_range
        let izinHours = 0;
        
        for (const izin of izinData) {
          try {
            const tglMulai = new Date(izin.tgl_mulai);
            const tglSelesai = new Date(izin.tgl_selesai);
            
            // Get jam_masuk and batas_masuk
            const jamMasuk = p.jam_masuk_custom || (defaultJamKerja ? defaultJamKerja.jam_masuk : '08:00');
            const batasMasuk = defaultJamKerja ? defaultJamKerja.batas_masuk : '08:10';
            
            // Calculate work hours per day for this leave
            const totalJamKerjaPerHari = calculateMinutesBetween(jamMasuk, batasMasuk);
            
            // Count how many days of this leave period fall within the month range (start - end)
            let jumlahHariIzin = 0;
            const currentDate = new Date(tglMulai);
            
            while (currentDate <= tglSelesai && currentDate < end) {
              if (currentDate >= start) {
                jumlahHariIzin++;
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // Add to total izin hours: daily_hours × number_of_days_in_month_range
            const izinPeriodHours = totalJamKerjaPerHari * jumlahHariIzin;
            izinHours += izinPeriodHours;
            
            console.log(`[getRekapBulanan] Pegawai ${p.id_pegawai} - Izin (${tglMulai.toLocaleDateString()} - ${tglSelesai.toLocaleDateString()}): ${jumlahHariIzin} days × ${totalJamKerjaPerHari.toFixed(2)} hours/day = ${izinPeriodHours.toFixed(2)} hours`);
          } catch (err) {
            console.error(`[getRekapBulanan] Error processing izin for pegawai ${p.id_pegawai}:`, err.message);
          }
        }

        const totalJamKerja = parseFloat((totalDetikKerja / 3600 + izinHours).toFixed(4));
        const rataRataJamKerja = countHariKerja > 0 ? parseFloat(((totalDetikKerja / 3600) / countHariKerja).toFixed(4)) : 0;

        return {
          nama_lengkap: p.nama_lengkap,
          id_pegawai: p.id_pegawai,
          hadir,
          terlambat,
          pulang_cepat,
          izin: izinData.length,
          tanpa_keterangan,
          rata_rata_jam_kerja: rataRataJamKerja,
          total_detik_kerja: totalDetikKerja,
          total_menit_terlambat: totalMenitTerlambat,
          total_jam_kerja: totalJamKerja,
        };
      })
    );
    
    console.log(`[getRekapBulanan] Result count:`, result.length);
    return result;
  } catch (error) {
    console.error(`[getRekapBulanan] Error:`, error.message);
    console.error(`[getRekapBulanan] Error Code:`, error.code);
    throw error;
  }
}

async function getRekapPegawai(id_pegawai, start, end) {
  try {
    console.log(`[getRekapPegawai] Params - id: ${id_pegawai}, start: ${start.toISOString()}, end: ${end.toISOString()}`);

    // Fetch pegawai info
    const pegawai = await prisma.pegawai.findUnique({ where: { id_pegawai: Number(id_pegawai) } });

    // Fetch default jamKerja for batas_masuk
    const defaultJamKerja = await prisma.jamKerja.findFirst();

    // Fetch absensi rows for the pegawai in the period
    const absensiRows = await prisma.absensi.findMany({
      where: {
        id_pegawai: Number(id_pegawai),
        tgl_absensi: {
          gte: start,
          lt: end,
        },
      },
      include: { jamKerja: true },
    });

    // Fetch izin (disetujui) for period - get detailed data, not just count
    const izinData = await prisma.izin.findMany({
      where: {
        id_pegawai: Number(id_pegawai),
        status_izin: 'disetujui',
        tgl_mulai: { lte: end },
        tgl_selesai: { gte: start },
      },
    });

    // Compute aggregates similar to DashboardService
    let hadir = 0;
    let terlambat = 0;
    let pulang_cepat = 0;
    let tanpa_keterangan = 0;
    let totalDetikKerja = 0;
    let totalMenitTerlambat = 0;
    let countHariKerja = 0;

    absensiRows.forEach((a) => {
      if (a.status === 'hadir') hadir++;
      if (a.status === 'terlambat') terlambat++;
      if (a.status_pulang === 'pulang_cepat') pulang_cepat++;
      if (a.status === 'alfa') tanpa_keterangan++;

      const jt = Number(a.jam_terlambat ?? 0) || 0;
      totalMenitTerlambat += jt;

      if (a.jam_masuk && a.jam_pulang) {
        const masuk = new Date(a.jam_masuk);
        const pulang = new Date(a.jam_pulang);
        // IMPORTANT: Calculate full duration WITHOUT subtracting lateness - lateness tracked separately in totalMenitTerlambat
        const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
        totalDetikKerja += durationSeconds;
        countHariKerja += 1;
      } else if (a.jam_masuk && !a.jam_pulang && a.jamKerja) {
        // Estimate with jam_pulang from jamKerja
        try {
          const masuk = new Date(a.jam_masuk);
          const jamPulangStr = String(a.jamKerja.jam_pulang || "17:00");
          const [hStr, mStr] = jamPulangStr.split(":").map(x => x.trim());
          const h = parseInt(hStr, 10) || 17;
          const m = parseInt(mStr, 10) || 0;
          
          const pulang = new Date(masuk);
          pulang.setHours(h, m, 0, 0);
          if (pulang < masuk) pulang.setDate(pulang.getDate() + 1);
          
          const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
          totalDetikKerja += durationSeconds;
          countHariKerja += 1;
        } catch (e) {
          console.warn(`[getRekapPegawai] Error estimating work hours for pegawai ${id_pegawai}:`, e.message);
        }
      } else if (!a.jam_masuk && a.jamKerja && (a.status === 'hadir' || a.status === 'terlambat')) {
        // Estimate full day from jamKerja
        try {
          const jamMasukStr = String(a.jamKerja.jam_masuk || "08:00");
          const jamPulangStr = String(a.jamKerja.jam_pulang || "17:00");
          
          const [hMasuk, mMasuk] = jamMasukStr.split(":").map(x => x.trim());
          const [hPulang, mPulang] = jamPulangStr.split(":").map(x => x.trim());
          
          const masuk = new Date(new Date(a.tgl_absensi).toDateString());
          masuk.setHours(parseInt(hMasuk, 10) || 8, parseInt(mMasuk, 10) || 0, 0, 0);
          
          const pulang = new Date(new Date(a.tgl_absensi).toDateString());
          pulang.setHours(parseInt(hPulang, 10) || 17, parseInt(mPulang, 10) || 0, 0, 0);
          if (pulang < masuk) pulang.setDate(pulang.getDate() + 1);
          
          const durationSeconds = Math.max(0, Math.round((pulang - masuk) / 1000));
          totalDetikKerja += durationSeconds;
          countHariKerja += 1;
        } catch (e) {
          console.warn(`[getRekapPegawai] Error estimating full day for pegawai ${id_pegawai}:`, e.message);
        }
      }
    });

    // Calculate work hours for approved leave days
    // Formula: (batas_masuk - jam_masuk) × number_of_days_in_month_range
    let izinHours = 0;
    
    for (const izin of izinData) {
      try {
        const tglMulai = new Date(izin.tgl_mulai);
        const tglSelesai = new Date(izin.tgl_selesai);
        
        // Get jam_masuk and batas_masuk
        const jamMasuk = pegawai?.jam_masuk_custom || (defaultJamKerja ? defaultJamKerja.jam_masuk : '08:00');
        const batasMasuk = defaultJamKerja ? defaultJamKerja.batas_masuk : '08:10';
        
        // Calculate work hours per day for this leave
        const totalJamKerjaPerHari = calculateMinutesBetween(jamMasuk, batasMasuk);
        
        // Count how many days of this leave period fall within the month range (start - end)
        let jumlahHariIzin = 0;
        const currentDate = new Date(tglMulai);
        
        while (currentDate <= tglSelesai && currentDate < end) {
          if (currentDate >= start) {
            jumlahHariIzin++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Add to total izin hours: daily_hours × number_of_days_in_month_range
        const izinPeriodHours = totalJamKerjaPerHari * jumlahHariIzin;
        izinHours += izinPeriodHours;
        
        console.log(`[getRekapPegawai] Pegawai ${id_pegawai} - Izin (${tglMulai.toLocaleDateString()} - ${tglSelesai.toLocaleDateString()}): ${jumlahHariIzin} days × ${totalJamKerjaPerHari.toFixed(2)} hours/day = ${izinPeriodHours.toFixed(2)} hours`);
      } catch (err) {
        console.error(`[getRekapPegawai] Error processing izin for pegawai ${id_pegawai}:`, err.message);
      }
    }

    const totalJamKerja = parseFloat((totalDetikKerja / 3600 + izinHours).toFixed(4));
    const rataRataJamKerja = countHariKerja > 0 ? parseFloat(((totalDetikKerja / 3600) / countHariKerja).toFixed(4)) : 0;

    const resultObj = {
      nama_lengkap: pegawai?.nama_lengkap || null,
      id_pegawai: Number(id_pegawai),
      hadir: Number(hadir),
      terlambat: Number(terlambat),
      pulang_cepat: Number(pulang_cepat),
      izin: Number(izinData.length || 0),
      tanpa_keterangan: Number(tanpa_keterangan),
      rata_rata_jam_kerja: rataRataJamKerja,
      total_detik_kerja: Number(totalDetikKerja),
      total_menit_terlambat: Number(totalMenitTerlambat),
      total_jam_kerja: totalJamKerja,
    };

    console.log(`[getRekapPegawai] Computed:`, resultObj);
    return [resultObj];
  } catch (error) {
    console.error(`[getRekapPegawai] Error Message:`, error.message);
    console.error(`[getRekapPegawai] Error Code:`, error.code);
    console.error(`[getRekapPegawai] Error Full:`, error);
    throw error;
  }
}

async function getRekapKeseluruhan(id_pegawai) {
  try {
    // Ambil data absensi
    const absensi = await prisma.absensi.findMany({
      where: { id_pegawai: Number(id_pegawai) },
    });

    // Ambil data izin yang disetujui
    const izin = await prisma.izin.findMany({
      where: {
        id_pegawai: Number(id_pegawai),
        status_izin: "disetujui",
      },
    });

    // Hitung statistik
    const hadir = absensi.filter((a) => a.status === "hadir").length;
    const terlambat = absensi.filter((a) => a.status === "terlambat").length;
    const pulang_cepat = absensi.filter((a) => a.status_pulang === "pulang_cepat").length;
    const tanpa_keterangan = absensi.filter((a) => a.status === "alfa").length;
    const totalIzin = izin.length;

    // Hitung rata-rata jam kerja
    let total_jam_kerja = 0;
    let count_hari_kerja = 0;

    absensi.forEach((a) => {
      if (a.jam_masuk && a.jam_pulang) {
        const jam_kerja =
          (new Date(a.jam_pulang) - new Date(a.jam_masuk)) / (1000 * 60 * 60);
        total_jam_kerja += jam_kerja;
        count_hari_kerja += 1;
      }
    });

    const rata_rata_jam_kerja =
      count_hari_kerja > 0 ? (total_jam_kerja / count_hari_kerja).toFixed(2) : 0;

    return {
      hadir,
      terlambat,
      pulang_cepat,
      izin: totalIzin,
      tanpa_keterangan,
      rata_rata_jam_kerja: parseFloat(rata_rata_jam_kerja),
    };
  } catch (error) {
    console.error("Error in getRekapKeseluruhan:", error);
    throw error;
  }
}

module.exports = { getRekapBulanan, getRekapPegawai, getRekapKeseluruhan };
