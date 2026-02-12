const express = require("express");
const { protectAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
  getAllIzin,
  getIzinById,
  createIzin,
  updateIzin,
  deleteIzin,
  getIzinByPegawai,
  searchIzin,
  getIzinRecap,
  getIzinToday,
} = require("../controllers/izin.controller");
const { uploadIzinMiddleware } = require("../middleware/uploadIzinmiddleware");

const izinRouter = express.Router();

izinRouter.get("/", protectAuth, isAdmin, getAllIzin);
izinRouter.get("/search", protectAuth, isAdmin, searchIzin);
izinRouter.get("/recap", protectAuth, isAdmin, getIzinRecap);
izinRouter.get("/today", protectAuth, getIzinToday);
izinRouter.get("/:id", protectAuth, getIzinById);
izinRouter.get("/pegawai/:id", protectAuth, getIzinByPegawai);
izinRouter.post(
  "/",
  protectAuth,
  uploadIzinMiddleware,
  createIzin,
);
izinRouter.put("/:id", protectAuth, updateIzin);
izinRouter.delete("/:id", protectAuth, deleteIzin);

module.exports = izinRouter;
