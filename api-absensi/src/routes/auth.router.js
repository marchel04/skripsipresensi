const express = require("express");
const AuthController = require("../controllers/auth.controller.js");
const { protectAuth } = require("../middleware/authMiddleware.js");
const { isAdmin } = require("../middleware/roleMiddleware.js");

const router = express.Router();

// POST /auth/login  (public)
router.post("/login", AuthController.validateLoginData, AuthController.login);

// POST /auth/logout  (private)
router.post("/logout", protectAuth, AuthController.logout);

// GET /auth/me  (private)
router.get("/me", protectAuth, AuthController.getMe);

// POST /auth/forgot-password  (public) - user lupa password
router.post("/forgot-password", AuthController.forgotPassword);

// PUT /auth/reset-password/:nip  (private, admin only) - admin reset password pegawai
router.put("/reset-password/:nip", protectAuth, isAdmin, AuthController.adminResetPasswordPegawai);

module.exports = router;
