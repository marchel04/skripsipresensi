const express = require("express");
const { protectAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
  getAdminDashboard,
  getAbsensiReport,
  printAbsensiReport,
} = require("../controllers/dashboard.controller");

const dashboardRouter = express.Router();

dashboardRouter.get("/", protectAuth, isAdmin, getAdminDashboard);
dashboardRouter.get("/laporan/absensi", protectAuth, isAdmin, getAbsensiReport);
dashboardRouter.get("/laporan/absensi/debug", protectAuth, isAdmin, getAbsensiReport);
dashboardRouter.get("/laporan/absensi/cetak", protectAuth, isAdmin, printAbsensiReport);

module.exports = dashboardRouter;
