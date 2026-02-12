const LoginService = require("../services/login.service");
const { LoginSchema, LoginUpdateSchema } = require("../types/login.types");

const LoginController = {
  // 🔹 Ambil semua login
  getAllLogin: async function (req, res, next) {
    try {
      const data = await LoginService.getAllLoginService();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Ambil login berdasarkan NIP
  getLoginByNip: async function (req, res, next) {
    try {
      const data = await LoginService.getLoginServiceByNip(req.params.nip);
      if (!data) {
        return res.status(404).json({ message: "Login not found" });
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Buat login baru
  createLogin: async function (req, res, next) {
    try {
      const validated = LoginSchema.parse(req.body);
      const newLogin = await LoginService.createLoginService(validated);
      res.status(201).json(newLogin);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Update login (biasanya password)
  updateLogin: async function (req, res, next) {
    try {
      const validated = LoginUpdateSchema.parse(req.body);
      const updated = await LoginService.updateLoginService(
        req.params.nip,
        validated
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Hapus login
  deleteLogin: async function (req, res, next) {
    try {
      await LoginService.deleteLoginService(req.params.nip);
      res.json({ message: "Login deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = LoginController;
