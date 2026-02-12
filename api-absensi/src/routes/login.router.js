const express = require("express");
const {
    getAllLogin,
    getLoginByNip,
    createLogin,
    updateLogin,
    deleteLogin,
} = require("../controllers/login.controller");
const { protectAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAuth, getAllLogin);
router.get("/:nip", protectAuth, getLoginByNip);
router.post("/", protectAuth, createLogin);
router.put("/:nip", protectAuth, updateLogin);
router.delete("/:nip", protectAuth, deleteLogin);

module.exports = router;
