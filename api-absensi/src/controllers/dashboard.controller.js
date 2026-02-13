const DashboardService = require("../services/dashboard.service");
const { sendNotFoundResponse } = require("../utils/responseHandler");

const DashboardController = {
  /**
   * GET /admin/dashboard
   * Ambil statistik dashboard admin dengan KPI
   */
  getAdminDashboard: async (req, res, next) => {
    try {
      const { tanggal } = req.query;
      const stats = await DashboardService.getAdminDashboardStats(tanggal);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/laporan/absensi
   * Ambil laporan absensi dengan filter dan rekap
   */
  getAbsensiReport: async (req, res, next) => {
    try {
      const { tanggal, bulan, tahun, pegawaiId } = req.query;

      const report = await DashboardService.getAbsensiReport({
        tanggal,
        bulan: bulan ? parseInt(bulan) : null,
        tahun: tahun ? parseInt(tahun) : null,
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : null,
      });

      // If request path includes /debug, return raw recap payload for inspection
      if (req.path && req.path.includes("/debug")) {
        return res.json({ success: true, rawRecap: report.recap, rawData: report.data });
      }

      return res.json({
        success: true,
        data: report.data,
        recap: report.recap,
        count: report.count,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/laporan/absensi/cetak
   * Export laporan absensi untuk printing
   */
  printAbsensiReport: async (req, res, next) => {
    try {
      const { tanggal, bulan, tahun, pegawaiId } = req.query;

      const report = await DashboardService.getAbsensiReport({
        tanggal,
        bulan: bulan ? parseInt(bulan) : null,
        tahun: tahun ? parseInt(tahun) : null,
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : null,
      });

      // Return HTML untuk print atau bisa juga return JSON
      // Frontend akan handle pembuatan HTML untuk print
      return res.json({
        success: true,
        data: report.data,
        recap: report.recap,
        count: report.count,
        printMode: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = DashboardController;
