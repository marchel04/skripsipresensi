
const JamKerjaService = require("../services/jamKerja.service");
const { JamKerjaSchema, JamKerjaUpdateSchema } = require("../types/jamKerja.types");
const {
  sendNotFoundResponse,
} = require("../utils/responseHandler");

const JamKerjaController = {
  getAllJamKerja: async (req, res, next) => {
    try {
      const data = await JamKerjaService.getAllJamKerjaService();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getJamKerjaById: async (req, res, next) => {
    try {
      const data = await JamKerjaService.getJamKerjaServiceById(req.params.id);
      if (!data) {
        return sendNotFoundResponse(res, "JamKerja not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  createJamKerja: async (req, res, next) => {
    try {
      const validated = JamKerjaSchema.parse(req.body);
      const newJamKerja = await JamKerjaService.createJamKerjaService(validated);
      res.status(201).json({ success: true, data: newJamKerja });
    } catch (err) {
      next(err);
    }
  },

  updateJamKerja: async (req, res, next) => {
    try {
      const validated = JamKerjaUpdateSchema.parse(req.body);
      const updated = await JamKerjaService.updateJamKerjaService(
        req.params.id,
        validated
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  deleteJamKerja: async (req, res, next) => {
    try {
      await JamKerjaService.deleteJamKerjaService(req.params.id);
      res.json({ message: "JamKerja deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = JamKerjaController;
