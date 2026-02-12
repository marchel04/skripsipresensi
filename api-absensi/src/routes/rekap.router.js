const express = require("express");

const { cetakRekapBulanan, getDataRekapBulanan, getRekapPegawai, getRekapPegawaiKeseluruhan, getRekapPegawaiById, cetakRekapPegawai } = require("../controllers/rekap.controller");
const { protectAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const rekapRouter = express.Router();

rekapRouter.get("/data-bulanan", protectAuth, isAdmin, getDataRekapBulanan);
// Untuk pegawai yang login: /api/rekap/pegawai?bulan=YYYY-MM
rekapRouter.get("/pegawai", protectAuth, getRekapPegawai);
// Untuk admin melihat rekap pegawai tertentu: /api/rekap/pegawai/:id?bulan=YYYY-MM
rekapRouter.get("/pegawai/:id", protectAuth, isAdmin, getRekapPegawaiById);
rekapRouter.get("/pegawai-keseluruhan", protectAuth, getRekapPegawaiKeseluruhan);
rekapRouter.get("/cetak-bulanan", protectAuth, isAdmin, cetakRekapBulanan);
// Untuk pegawai cetak rekap personal: /api/rekap/cetak-pegawai?bulan=YYYY-MM
rekapRouter.get("/cetak-pegawai", protectAuth, cetakRekapPegawai);

module.exports = rekapRouter;
