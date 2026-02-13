const { boolean } = require("zod");
const prisma = require("../utils/prisma.js");

const DivisiService = {
  getAllDivisiService: async function () {
    return await prisma.divisi.findMany({
      orderBy: { id_divisi: "asc" },
    });
  },

  getDivisiServiceById: async function (id) {
    return await prisma.divisi.findUnique({
      where: { id_divisi: Number(id) },
    });
  },

  createDivisiService: async function (data) {
    return await prisma.divisi.create({ data });
  },

  updateDivisiService: async function (id, data) {
    return await prisma.divisi.update({
      where: { id_divisi: Number(id) },
      data,
    });
  },

  deleteDivisiService: async function (id) {
    return await prisma.divisi.delete({
      where: { id_divisi: Number(id) },
    });
  },
};

module.exports = DivisiService;
