const puppeteer = require("puppeteer");
const { getRekapBulanan, getRekapPegawai, getRekapKeseluruhan } = require("../services/rekap.service");
const renderHTML = require("../templates/laporan-resmi.html");

exports.getDataRekapBulanan = async (req, res, next) => {
  try {
    const { bulan } = req.query;
    if (!bulan) return res.status(400).json({ success: false, message: "bulan wajib" });

    // Validasi format bulan YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      return res.status(400).json({ success: false, message: "Format bulan harus YYYY-MM" });
    }

    const start = new Date(`${bulan}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    console.log("[getDataRekapBulanan] Fetching data for bulan:", bulan, "start:", start.toISOString(), "end:", end.toISOString());

    const data = await getRekapBulanan(start, end);
    console.log("[getDataRekapBulanan] Success, data count:", data?.length);

    // Filter out pegawai yang tidak memiliki data absensi/izin pada periode
    const filtered = (data || []).filter((d) => {
      const hasHadir = Number(d.hadir || 0) > 0;
      const hasIzin = Number(d.izin || 0) > 0;
      const hasWorkSeconds = Number(d.total_detik_kerja || 0) > 0;
      const hasLateMinutes = Number(d.total_menit_terlambat || 0) > 0;
      return hasHadir || hasIzin || hasWorkSeconds || hasLateMinutes;
    });

    console.log("[getDataRekapBulanan] Filtered result count:", filtered.length);

    res.json({ success: true, data: filtered });
  } catch (err) {
    console.error("Error in getDataRekapBulanan - Message:", err.message);
    console.error("Error in getDataRekapBulanan - Stack:", err.stack);
    console.error("Error in getDataRekapBulanan - Full:", err);
    next(err);
  }
};

exports.getRekapPegawai = async (req, res, next) => {
  try {
    const { bulan } = req.query;
    if (!bulan) return res.status(400).json({ success: false, message: "bulan wajib" });

    // Validasi format bulan YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      return res.status(400).json({ success: false, message: "Format bulan harus YYYY-MM" });
    }

    if (!req.user || !req.user.id_pegawai) {
      return res.status(401).json({ success: false, message: "User tidak teridentifikasi" });
    }

    const start = new Date(`${bulan}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    console.log(`[getRekapPegawai] id_pegawai: ${req.user.id_pegawai}, start: ${start.toISOString()}, end: ${end.toISOString()}`);

    const data = await getRekapPegawai(req.user.id_pegawai, start, end);
    console.log(`[getRekapPegawai] data:`, data);

    res.json({ success: true, data: data[0] || null });
  } catch (err) {
    console.error("Error in getRekapPegawai - Message:", err.message);
    console.error("Error in getRekapPegawai - Stack:", err.stack);
    
    // Return detailed error in development
    if (process.env.APP_ENV === 'development') {
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        details: err.stack
      });
    }
    
    next(err);
  }
};

exports.getRekapPegawaiById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bulan } = req.query;
    if (!bulan) return res.status(400).json({ success: false, message: "bulan wajib" });

    // Validasi format bulan YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      return res.status(400).json({ success: false, message: "Format bulan harus YYYY-MM" });
    }

    const start = new Date(`${bulan}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const data = await getRekapPegawai(id, start, end);

    res.json({ success: true, data: data[0] || null });
  } catch (err) {
    console.error("Error in getRekapPegawaiById:", err);
    next(err);
  }
};

exports.getRekapPegawaiKeseluruhan = async (req, res, next) => {
  try {
    const data = await getRekapKeseluruhan(req.user.id_pegawai);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in getRekapPegawaiKeseluruhan:", err);
    next(err);
  }
};

exports.cetakRekapBulanan = async (req, res, next) => {
  try {
    const { bulan, pegawaiId } = req.query;
    if (!bulan) return res.status(400).json({ message: "bulan wajib" });

    // Validasi format bulan YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      return res.status(400).json({ message: "Format bulan harus YYYY-MM" });
    }

    const start = new Date(`${bulan}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    let data;
    if (pegawaiId) {
      // Export hanya untuk pegawai tertentu
      data = await getRekapPegawai(Number(pegawaiId), start, end);
      // getRekapPegawai returns array, maka ambil data dan wrap dalam array
      data = data && data[0] ? [data[0]] : [];
    } else {
      // Export semua pegawai (default)
      data = await getRekapBulanan(start, end);
    }

    const html = renderHTML(data, bulan);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=rekap-absensi-${bulan}.pdf`,
    );

    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

// Cetak rekap pegawai personal - untuk pegawai yang login
exports.cetakRekapPegawai = async (req, res, next) => {
  try {
    const { bulan } = req.query;
    if (!bulan) return res.status(400).json({ success: false, message: "bulan wajib" });

    if (!req.user || !req.user.id_pegawai) {
      return res.status(401).json({ success: false, message: "User tidak teridentifikasi" });
    }

    const start = new Date(`${bulan}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const data = await getRekapPegawai(req.user.id_pegawai, start, end);
    
    // Query selalu return minimal 1 row (dengan GROUP BY), jadi check yang meaningful
    let rekapData = data[0] || null;
    
    // Jika tidak ada data, ambil info pegawai aja biar PDF tetap bisa dibuat
    if (!rekapData) {
      const pegawai = await require("../utils/prisma").pegawai.findUnique({
        where: { id_pegawai: req.user.id_pegawai }
      });
      
      if (!pegawai) {
        return res.status(404).json({ success: false, message: "Pegawai tidak ditemukan" });
      }
      
      // Return minimal data dengan semua field 0
      rekapData = {
        nama_lengkap: pegawai.nama_lengkap,
        id_pegawai: pegawai.id_pegawai,
        hadir: 0,
        terlambat: 0,
        pulang_cepat: 0,
        izin: 0,
        tanpa_keterangan: 0,
        rata_rata_jam_kerja: 0
      };
    }

    // Buat HTML untuk rekap pegawai
    const nama_lengkap = req.user.nama_lengkap || "Pegawai";
    const nip = req.user.nip || "-";
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .info-box { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #1890ff; }
            .info-box p { margin: 8px 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
            .stat-label { font-size: 12px; color: #666; font-weight: bold; }
            .stat-value { font-size: 28px; font-weight: bold; color: #1890ff; margin-top: 8px; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Rekap Absensi Bulanan</h1>
            <p>Bulan: ${new Date(start).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div class="info-box">
            <p><strong>Nama:</strong> ${nama_lengkap}</p>
            <p><strong>NIP:</strong> ${nip}</p>
            <p><strong>Periode:</strong> ${new Date(start).toLocaleDateString('id-ID')} - ${new Date(new Date(end).getTime() - 86400000).toLocaleDateString('id-ID')}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Hadir</div>
              <div class="stat-value" style="color: #52c41a;">${rekapData.hadir || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Terlambat</div>
              <div class="stat-value" style="color: #faad14;">${rekapData.terlambat || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Izin</div>
              <div class="stat-value" style="color: #722ed1;">${rekapData.izin || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tanpa Keterangan</div>
              <div class="stat-value" style="color: #f5222d;">${rekapData.tanpa_keterangan || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pulang Cepat</div>
              <div class="stat-value" style="color: #eb2f96;">${rekapData.pulang_cepat || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Rata-rata Jam Kerja</div>
              <div class="stat-value" style="color: #13c2c2;">${(rekapData.rata_rata_jam_kerja || 0).toFixed(2)} jam</div>
            </div>
          </div>

          <div class="footer">
            <p>Laporan ini dicetak secara otomatis pada: ${new Date().toLocaleString('id-ID')}</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=rekap-pegawai-${bulan}.pdf`,
    );

    res.send(pdf);
  } catch (err) {
    console.error("Error in cetakRekapPegawai:", err);
    next(err);
  }
};
