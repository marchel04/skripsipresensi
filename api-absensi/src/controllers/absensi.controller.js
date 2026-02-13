const AbsensiService = require("../services/absensi.service");
const DashboardService = require("../services/dashboard.service");
const {
  AbsensiSchema,
  AbsensiUpdateSchema,
} = require("../types/absensi.types");
const { sendNotFoundResponse } = require("../utils/responseHandler");

// ==================== DOKUMENTASI ABSENSI CONTROLLER ====================
// Controller untuk menangani semua operasi absensi pegawai
// Mencakup: get all, get by id/pegawai, get today, get terlambat, create, update, delete
// =========================================================================

const AbsensiController = {
  // -------- GET ALL ABSENSI --------
  // Fungsi: Mengambil semua data absensi beserta detail pegawainya
  // Output: Array berisi data absensi terurut berdasarkan ID pegawai
  getAllAbsensi: async (req, res, next) => {
    try {
      const data = await AbsensiService.getAllAbsensiService();
      res.json({ success: true, data });
      console.log("Get all absensi : ", data);
    } catch (err) {
      next(err);
    }
  },

  // -------- GET ABSENSI BY ID --------
  // Fungsi: Mengambil data absensi berdasarkan ID absensi tertentu
  // Validasi: ID harus ada dan data harus tersedia
  // Output: Detail absensi atau error 404 jika tidak ditemukan
  getAbsensiById: async (req, res, next) => {
    try {
      const data = await AbsensiService.getAbsensiServiceById(req.params.id);
      if (!data) {
        return sendNotFoundResponse(res, "Absensi not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  // -------- GET ABSENSI BY PEGAWAI --------
  // Fungsi: Mengambil semua data absensi dari pegawai tertentu berdasarkan ID pegawai
  // Output: Array berisi riwayat absensi pegawai terurut dari terbaru
  getAbsensiByPegawai: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await AbsensiService.getAbsensiByPegawaiService(id);

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: { message: err.message },
      });
    }
  },

  // -------- GET ABSENSI BY PEGAWAI WITH DATE RANGE --------
  // Fungsi: Mengambil data absensi pegawai dalam range tanggal tertentu
  // Query params: tanggal_awal, tanggal_akhir (format: YYYY-MM-DD)
  // Output: Array berisi riwayat absensi pegawai dalam range tanggal terurut dari terbaru
  getAbsensiByPegawaiWithDateRange: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tanggal_awal, tanggal_akhir } = req.query;

      if (!tanggal_awal || !tanggal_akhir) {
        return res.status(400).json({
          success: false,
          error: { message: "tanggal_awal dan tanggal_akhir harus disediakan" },
        });
      }

      const data = await AbsensiService.getAbsensiByPegawaiWithDateRangeService(
        id,
        tanggal_awal,
        tanggal_akhir
      );

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // -------- GET TODAY ABSENSI --------
  // Fungsi: Mengambil data absensi hari ini dari user yang login
  // Note: User ID diambil dari token JWT yang sudah di-decode di middleware
  // Output: Detail absensi hari ini atau error 404 jika belum absen
  getTodayAbsensi: async (req, res, next) => {
    try {
      const data = await AbsensiService.getTodayAbsensiService(
        req.user.id_pegawai,
      );
      if (!data) {
        return sendNotFoundResponse(res, "Absensi not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  // -------- GET ALL ABSENSI TERLAMBAT --------
  // Fungsi: Mengambil semua data absensi yang memiliki status "terlambat"
  // Output: Array berisi data absensi terlambat dari semua pegawai
  getAllAbsensiTerlambat: async (req, res, next) => {
    try {
      const data = await AbsensiService.getAllAbsensiTerlambatService();
      if (!data) {
        return sendNotFoundResponse(res, "Absensi terlambat not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  // -------- GET TODAY ALL ABSENSI --------
  // Fungsi: Mengambil data absensi hari ini dari semua pegawai (distinct per pegawai)
  // Output: Array berisi satu entry per pegawai untuk hari ini
  getTodayAllAbsensi: async (req, res, next) => {
    try {
      const data = await AbsensiService.getTodayAllAbsensiService();
      if (!data) {
        return sendNotFoundResponse(res, "Absensi not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  // -------- GET TODAY TERLAMBAT --------
  // Fungsi: Mengambil data absensi hari ini yang terlambat atau pulang cepat
  // Output: Array berisi pegawai yang terlambat atau pulang cepat hari ini
  getTodayTerlambat: async (req, res, next) => {
    try {
      const data = await AbsensiService.getTodayTerlambatService();
      if (!data) {
        return sendNotFoundResponse(res, "Absensi not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  // -------- CREATE ABSENSI --------
  // Fungsi: Membuat data absensi baru untuk user yang login
  // Validasi: Validasi melalui AbsensiSchema
  // Proses: Check status terlambat berdasarkan jam kerja, simpan ke database
  // Output: Data absensi yang baru dibuat atau error jika validasi gagal
  createAbsensi: async (req, res) => {
    try {
      const result = await AbsensiService.createAbsensiService({
        ...req.body,
        user: req.user,
      });

      console.log("Absensi created successfully:", result);
      console.log(`[RESPONSE] jam_terlambat: ${result.jam_terlambat}, status: ${result.status}`);

      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // -------- UPDATE ABSENSI --------
  // Fungsi: Mengupdate data absensi dari user yang login
  // Validasi: Validasi melalui AbsensiUpdateSchema
  // Note: User ID diambil dari token JWT untuk keamanan (tidak bisa update absensi orang lain)
  // Output: Data absensi yang sudah diupdate
  updateAbsensi: async (req, res, next) => {
    try {
      const validated = AbsensiUpdateSchema.parse(req.body);

      const updated = await AbsensiService.updateAbsensiService(
        req.user.id_pegawai, // ← ambil dari token
        validated,
      );

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // -------- DELETE ABSENSI --------
  // Fungsi: Menghapus data absensi berdasarkan ID
  // Output: Pesan sukses jika berhasil dihapus
  deleteAbsensi: async (req, res, next) => {
    try {
      await AbsensiService.deleteAbsensiService(req.params.id);
      res.json({ message: "Absensi deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  // -------- GET ABSENSI DAN IZIN GABUNGAN --------
  // Fungsi: Mengambil data absensi dan izin dari pegawai tertentu dalam satu list
  // Output: Array berisi kombinasi absensi dan izin terurut dari terbaru
  getAbsensiDanIzin: async (req, res, next) => {
    try {
      const data = await AbsensiService.getAbsensiDanIzinByPegawaiService(
        req.user.id_pegawai,
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -------- GET ABSENSI RECAP (MONTHLY) --------
  // Fungsi: Mengambil rekap absensi bulanan per pegawai dengan summary
  // Query params: bulan, tahun, pegawaiId (optional)
  // Output: Array rekap dengan totalHadir, totalTerlambat, totalJamKerja, dll
  getAbsensiRecap: async (req, res, next) => {
    try {
      const { bulan, tahun, pegawaiId } = req.query;
      
      if (!bulan || !tahun) {
        return res.status(400).json({
          success: false,
          error: { message: "bulan dan tahun harus disediakan" },
        });
      }

      const result = await DashboardService.getAbsensiReport({
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : undefined,
      });

      return res.json({
        success: true,
        recap: result.recap || [],
        data: result.data || [],
        count: result.count || 0,
      });
    } catch (err) {
      next(err);
    }
  },
  // Admin: gabungkan absensi + izin untuk tabel admin
  getAllAbsensiDanIzin: async (req, res, next) => {
    try {
      const { tanggal_awal, tanggal_akhir } = req.query;
      const data = await AbsensiService.getAllAbsensiDanIzinService({ tanggal_awal, tanggal_akhir });
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AbsensiController;
