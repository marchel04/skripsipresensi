const DivisiService = require("../services/divisi.service");
const {
  DivisiSchema,
  DivisiUpdateSchema,
} = require("../types/divisi.types");
const {
  sendNotFoundResponse,
} = require("../utils/responseHandler");

const DivisiController = {
  getAllDivisi: async (req, res, next) => {
    try {
      const data = await DivisiService.getAllDivisiService();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getDivisiById: async (req, res, next) => {
    try {
      const data = await DivisiService.getDivisiServiceById(req.params.id);
      if (!data) {
        return sendNotFoundResponse(res, "Divisi not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  createDivisi: async (req, res, next) => {
    try {
      const validated = DivisiSchema.parse(req.body);
      const newDivisi = await DivisiService.createDivisiService(validated);
      res.status(201).json(newDivisi);
    } catch (err) {
      next(err);
    }
  },

  updateDivisi: async (req, res, next) => {
    try {
      const validated = DivisiUpdateSchema.parse(req.body);
      const updated = await DivisiService.updateDivisiService(
        req.params.id,
        validated
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteDivisi: async (req, res, next) => {
    try {
      await DivisiService.deleteDivisiService(req.params.id);
      res.json({ message: "Divisi deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DivisiController;
