const express = require("express");
const { protectAuth } = require("../middleware/authMiddleware");
const {
  getAllAbsensi,
  getAbsensiById,
  createAbsensi,
  updateAbsensi,
  deleteAbsensi,
  getTodayAbsensi,
  getAbsensiByPegawai,
  getAbsensiByPegawaiWithDateRange,
  getAllAbsensiTerlambat,
  getTodayAllAbsensi,
  getTodayTerlambat,
  getAbsensiDanIzin,
  getAllAbsensiDanIzin,
  getAbsensiRecap,
} = require("../controllers/absensi.controller");
const { isAdmin } = require("../middleware/roleMiddleware");

const absensiRouter = express.Router();

absensiRouter.get("/recap", protectAuth, isAdmin, getAbsensiRecap);
absensiRouter.get("/", protectAuth, isAdmin, getAllAbsensi);
absensiRouter.get(
  "/all/terlambat",
  protectAuth,
  isAdmin,
  getAllAbsensiTerlambat,
);
absensiRouter.get("/all/today", protectAuth, isAdmin, getTodayAllAbsensi);
absensiRouter.get("/today/terlambat", protectAuth, getTodayTerlambat);
absensiRouter.get("/today", protectAuth, getTodayAbsensi);
absensiRouter.get("/riwayat/gabungan", protectAuth, getAbsensiDanIzin);
absensiRouter.get("/gabungan", protectAuth, isAdmin, getAllAbsensiDanIzin);
absensiRouter.get("/pegawai/:id/range", protectAuth, getAbsensiByPegawaiWithDateRange);
absensiRouter.get("/pegawai/:id", protectAuth, getAbsensiByPegawai);
absensiRouter.get("/:id", protectAuth, getAbsensiById);
absensiRouter.post("/", protectAuth, createAbsensi);
absensiRouter.put("/pulang", protectAuth, updateAbsensi);
absensiRouter.delete("/:id", protectAuth, deleteAbsensi);

module.exports = absensiRouter;
