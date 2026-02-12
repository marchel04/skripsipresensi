const {
  PegawaiUpdateSchema,
  PegawaiSchema,
} = require("../types/pegawai.types.js");
const prisma = require("../utils/prisma.js");
const bcrypt = require("bcrypt");

const PegawaiService = {
  getAllPegawaiService: async function () {
    return await prisma.pegawai.findMany({
      include: { divisi: true },
      orderBy: { nip: "asc" },
    });
  },

  getPegawaiServiceByNip: async function (nip) {
    return await prisma.pegawai.findUnique({
      include: { divisi: true },
      where: { nip: nip },
    });
  },

  createPegawaiService: async function (payload) {
    const validated = PegawaiSchema.parse(payload);

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const pegawai = await prisma.pegawai.create({
      data: {
        ...validated,
        password: hashedPassword,
      },
    });

    await prisma.login.create({
      data: {
        nip: pegawai.nip,
        password: hashedPassword,
      },
    });

    return pegawai;
  },

  updatePegawaiService: async function (id, payload) {
    const validated = PegawaiUpdateSchema.parse(payload);
    const existing = await prisma.pegawai.findUnique({
      where: { id_pegawai: Number(id) },
    });
    if (!existing) throw new Error("Pegawai not found");

    let updateData = { ...validated };

    if (validated.password) {
      const hashedPassword = await bcrypt.hash(validated.password, 10);
      updateData.password = hashedPassword;

      await prisma.login.update({
        where: { nip: existing.nip },
        data: { password: hashedPassword },
      });
    }

    return await prisma.pegawai.update({
      where: { id_pegawai: Number(id) },
      data: updateData,
    });
  },

  updateFotoProfilService: async function (id, filename) {
    return prisma.pegawai.update({
      where: {
        id_pegawai: Number(id),
      },
      data: {
        foto_profil: filename,
      },
      select: {
        id_pegawai: true,
        nama_lengkap: true,
        foto_profil: true,
      },
    });
  },

  updatePasswordService: async function (id, newPassword) {
    if (!newPassword) {
      throw new Error("Password is required");
    }

    const pegawai = await prisma.pegawai.findUnique({
      where: { id_pegawai: Number(id) },
    });

    if (!pegawai) throw new Error("Pegawai not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.login.update({
      where: { nip: pegawai.nip },
      data: { password: hashedPassword },
    });

    return prisma.pegawai.update({
      where: { id_pegawai: Number(id) },
      data: {
        password: hashedPassword,
      },
    });
  },

  deletePegawaiService: async function (id) {
    const pegawai = await prisma.pegawai.findUnique({
      where: { id_pegawai: Number(id) },
    });

    if (!pegawai) throw new Error("Pegawai not found");

    await prisma.login.delete({
      where: { nip: pegawai.nip },
    });

    return await prisma.pegawai.delete({
      where: { id_pegawai: Number(id) },
    });
  },
};

module.exports = PegawaiService;
