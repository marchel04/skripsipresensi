const express = require("express");

const { protectAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { getAllJamKerja, getJamKerjaById, createJamKerja, updateJamKerja, deleteJamKerja } = require("../controllers/jamKerja.controller");

const jamKerjaRouter = express.Router();

jamKerjaRouter.get("/", getAllJamKerja);
jamKerjaRouter.get("/:id", getJamKerjaById);
jamKerjaRouter.post("/", protectAuth, isAdmin, createJamKerja);
jamKerjaRouter.put("/:id", protectAuth, isAdmin, updateJamKerja);
jamKerjaRouter.delete("/:id", protectAuth, isAdmin, deleteJamKerja);

module.exports = jamKerjaRouter;
