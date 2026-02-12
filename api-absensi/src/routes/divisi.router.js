const express = require("express");
const {
  getAllDivisi,
  getDivisiById,
  createDivisi,
  updateDivisi,
  deleteDivisi,
} = require("../controllers/divisi.controller");
const { protectAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const divisiRouter = express.Router();

divisiRouter.get("/", getAllDivisi);
divisiRouter.get("/:id", getDivisiById);
divisiRouter.post("/", protectAuth, isAdmin, createDivisi);
divisiRouter.put("/:id", protectAuth, isAdmin, updateDivisi);
divisiRouter.delete("/:id", protectAuth, isAdmin, deleteDivisi);

module.exports = divisiRouter;
