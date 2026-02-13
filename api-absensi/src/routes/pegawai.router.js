const express = require("express");
const { protectAuth } = require("../middleware/authMiddleware");
const {
  getAllPegawai,
  getPegawaiByNip,
  createPegawai,
  updatePegawai,
  deletePegawai,
  updateFotoProfil,
  updatePassword,
} = require("../controllers/pegawai.controller");
const { uploadprofilePic } = require("../utils/multerUploadHandler");

const pegawaiRouter = express.Router();

pegawaiRouter.get("/", protectAuth, getAllPegawai);
pegawaiRouter.get("/:id", getPegawaiByNip);
pegawaiRouter.post("/", protectAuth, createPegawai);
pegawaiRouter.put("/:id", protectAuth, updatePegawai);
pegawaiRouter.delete("/:id", protectAuth, deletePegawai);
pegawaiRouter.patch(
  "/update/foto",
  protectAuth,
  uploadprofilePic.single("photo"),
  updateFotoProfil,
);
pegawaiRouter.patch("/update/password", protectAuth, updatePassword);

module.exports = pegawaiRouter;
