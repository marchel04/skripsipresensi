const PegawaiService = require("../services/pegawai.service");
const {
  PegawaiSchema,
  PegawaiUpdateSchema,
} = require("../types/pegawai.types");

const PegawaiController = {
  getAllPegawai: async (req, res, next) => {
    try {
      const data = await PegawaiService.getAllPegawaiService();
      res.json({
        success: true,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },

  getPegawaiByNip: async (req, res, next) => {
    try {
      const data = await PegawaiService.getPegawaiServiceByNip(req.params.id);
      if (!data) return res.status(404).json({ message: "Pegawai not found!" });
      res.json({
        success: true,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },

  createPegawai: async (req, res, next) => {
    try {
      const validated = PegawaiSchema.parse(req.body);
      const newPegawai = await PegawaiService.createPegawaiService(validated);
      res.status(201).json(newPegawai);
    } catch (err) {
      next(err);
    }
  },

  updatePegawai: async (req, res, next) => {
    try {
      const validated = PegawaiUpdateSchema.parse(req.body);
      const updated = await PegawaiService.updatePegawaiService(
        req.params.id,
        validated,
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  updateFotoProfil: async (req, res, next) => {
    try {
      const id = req.user?.id_pegawai;

      if (!id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File foto profil wajib diupload",
        });
      }

      const result = await PegawaiService.updateFotoProfilService(
        id,
        req.file.filename,
      );

      return res.json({
        success: true,
        message: "Foto profil berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      console.error("updateFotoProfil error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui foto profil",
      });
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const id = req.user?.id_pegawai;
      const { newPassword } = req.body;

      if (!id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password baru minimal 6 karakter",
        });
      }

      console.log("new pass: ", newPassword);

      const result = await PegawaiService.updatePasswordService(
        id,
        newPassword,
      );

      return res.json({
        success: true,
        message: "Password berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      console.error("updateFotoProfil error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui password",
      });
    }
  },

  deletePegawai: async (req, res, next) => {
    try {
      await PegawaiService.deletePegawaiService(req.params.id);
      res.json({ message: "Pegawai deleted succesfully!" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PegawaiController;
