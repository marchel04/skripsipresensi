const IzinService = require("../services/izin.service");
const { IzinSchema, IzinUpdateSchema } = require("../types/izin.types");
const { sendNotFoundResponse } = require("../utils/responseHandler");

const IzinController = {
  getAllIzin: async (req, res, next) => {
    try {
      const data = await IzinService.getAllIzinService();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getIzinById: async (req, res, next) => {
    try {
      const data = await IzinService.getIzinServiceById(req.params.id);
      if (!data) {
        return sendNotFoundResponse(res, "Izin not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  getIzinByPegawai: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await IzinService.getIzinByPegawaiService(id);
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

  /**
   * GET /izin/search?tanggalMulai=...&tanggalSelesai=...&status=...
   * Pencarian izin dengan filter
   */
  searchIzin: async (req, res, next) => {
    try {
      const { tanggalMulai, tanggalSelesai, status, pegawaiId } = req.query;

      const data = await IzinService.searchIzinService({
        tanggalMulai,
        tanggalSelesai,
        status,
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : null,
      });

      return res.json({
        success: true,
        data,
        count: data.length,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /izin/recap?bulan=...&tahun=...
   * Rekap izin per pegawai berdasarkan bulan/tahun
   */
  getIzinRecap: async (req, res, next) => {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        return res.status(400).json({
          success: false,
          message: "bulan dan tahun harus disertakan",
        });
      }

      const data = await IzinService.getIzinRecapService(
        parseInt(bulan),
        parseInt(tahun)
      );

      return res.json({
        success: true,
        data,
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
      });
    } catch (err) {
      next(err);
    }
  },

  createIzin: async (req, res, next) => {
    try {
      const validated = IzinSchema.parse(req.body);

      let filepath = null;
      if (req.file) {
        // pastikan konsisten pakai slash
        const normalizedPath = req.file.path.replace(/\\/g, "/");

        // ambil path mulai dari /storage
        const index = normalizedPath.indexOf("/storage");
        filepath = index !== -1 ? normalizedPath.substring(index) : null;
      }

      const newIzin = await IzinService.createIzinService({
        ...validated,
        filepath,
        id_pegawai: req.user.id_pegawai,
      });

      res.status(201).json({
        success: true,
        data: newIzin,
      });
    } catch (err) {
      // Jika error validasi dari service (sudah melakukan presensi), kembalikan 400
      if (
        err &&
        err.message &&
        err.message.includes("Tidak dapat membuat izin karena")
      ) {
        return res.status(400).json({ success: false, message: err.message });
      }

      next(err);
    }
  },

  /**
   * GET /izin/today
   * Ambil izin yang disetujui untuk pegawai hari ini
   */
  getIzinToday: async (req, res, next) => {
    try {
      const data = await IzinService.getIzinTodayService(req.user.id_pegawai);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  updateIzin: async (req, res, next) => {
    try {
      const validated = IzinUpdateSchema.parse(req.body);
      const updated = await IzinService.updateIzinService(
        req.params.id,
        validated,
      );
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteIzin: async (req, res, next) => {
    try {
      await IzinService.deleteIzinService(req.params.id);
      res.json({ message: "Izin deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = IzinController;
