const BannerService = require("../services/banners.service");
const { BannerSchema, BannerUpdateSchema } = require("../types/banners.types");
const { deleteFileIfExists } = require("../utils/deleteFileHandler");
const { sendNotFoundResponse } = require("../utils/responseHandler");
const path = require("path");

const BannersController = {
  getAllBanner: async (req, res, next) => {
    try {
      const data = await BannerService.getAllBannerService();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getBannerById: async (req, res, next) => {
    try {
      const data = await BannerService.getBannerServiceById(req.params.id);
      if (!data) {
        return sendNotFoundResponse(res, "Content not found");
      } else {
        res.json({ success: true, data });
      }
    } catch (err) {
      next(err);
    }
  },

  createBanner: async (req, res, next) => {
    try {
      let body = { ...req.body };
      if (body.order) {
        body.order = Number(body.order);
      }

      const validated = BannerSchema.parse(body);

      let banner_path = null;
      if (req.file) {
        banner_path = `storage/uploads/contents/banners/` + req.file.filename;
      }

      const data = { ...validated, banner_path };

      const newBanner = await BannerService.createBannerService(data);
      res.status(201).json(newBanner);
    } catch (err) {
      next(err);
    }
  },

  updateBanner: async (req, res, next) => {
    try {
      let body = { ...req.body };
      if (body.banner_id) body.banner_id = Number(body.banner_id);
      if (body.order) body.order = Number(body.order);

      const oldBanner = await BannerService.getBannerServiceById(req.params.id);
      if (!oldBanner) {
        return sendNotFoundResponse(res, "Banner not found");
      }

      const validated = BannerUpdateSchema.parse(body);
      let banner_path = validated.banner_path;

      if (req.file) {
        if (oldBanner.banner_path) {
          const oldPath = path.join(__dirname, "../../", oldBanner.banner_path);
          deleteFileIfExists(oldPath);
        }
        banner_path = `storage/uploads/contents/banners/` + req.file.filename;
      }

      const data = { ...validated, banner_path };

      const updated = await BannerService.updateBannerService(
        req.params.id,
        data
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  deleteBanner: async (req, res, next) => {
    try {
      const oldBanner = await BannerService.getBannerServiceById(req.params.id);
      if (!oldBanner) {
        return sendNotFoundResponse(res, "Banner not found");
      }

      if (oldBanner.banner_path) {
        const oldPath = path.join(__dirname, "../../", oldBanner.banner_path);
        deleteFileIfExists(oldPath);
      }

      await BannerService.deleteBannerService(req.params.id);

      await res.json({ message: "Banner deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  reorderBanners: async (req, res, next) => {
    try {
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ message: "Invalid orderedIds array" });
      }

      await BannerService.reorderBannersService(orderedIds);
      res.json({ success: true, message: "Banners reordered successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BannersController;
