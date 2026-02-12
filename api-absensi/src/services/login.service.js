const prisma = require("../utils/prisma.js");

const LoginService = {
    // 🔹 Ambil semua login
    getAllLoginService: async function () {
        return await prisma.login.findMany({
            orderBy: { nip: "asc" },
            include: {
                pegawai: true,
            },
        });
    },

    // 🔹 Ambil login berdasarkan NIP
    getLoginServiceByNip: async function (nip) {
        return await prisma.login.findUnique({
            where: { nip: String(nip) },
            include: {
                pegawai: true,
            },
        });
    },

    // 🔹 Buat login baru
    createLoginService: async function (data) {
        return await prisma.login.create({
            data,
        });
    },

    // 🔹 Update password login
    updateLoginService: async function (nip, data) {
        return await prisma.login.update({
            where: { nip: String(nip) },
            data,
        });
    },

    // 🔹 Hapus login
    deleteLoginService: async function (nip) {
        return await prisma.login.delete({
            where: { nip: String(nip) },
        });
    },
};

module.exports = LoginService;
