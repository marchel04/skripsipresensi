const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const validateNIKMiddleware = async function validateNik(req, res, next) {
    const nik = req.params.nik;
    if (!nik) return res.status(400).json({ message: "NIK harus diisi!" });
    if (nik.length !== 16)
        return res.status(400).json({ message: "NIK harus 16 angka!" });

    const user = await prisma.users.findUnique({ where: { NIK: nik } });
    if (!user)
        return res.status(404).json({ message: "User/NIK tidak ditemukan!" });

    req.user = user;
    next();
};

module.exports = validateNIKMiddleware;
