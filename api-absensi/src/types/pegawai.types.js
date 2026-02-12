const { z } = require("zod");

// ENUM role mengikuti Prisma
const RoleEnum = z.enum(["admin", "pegawai"]);

const PegawaiSchema = z.object({
    nip: z.string().min(1).max(191),
    nama_lengkap: z.string().min(1).max(191),
    jenis_kelamin: z.string().min(1).max(50),
    tgl_lahir: z.coerce.date(),
    jabatan: z.string().min(1).max(191),
    id_divisi: z.number().int(),
    no_telepon: z.string().min(1).max(191),
    foto_profil: z.string().max(191).optional(),
    password: z.string().min(1).max(191).optional(),
    role: RoleEnum.optional(),
});

const PegawaiUpdateSchema = PegawaiSchema.partial();

module.exports = { PegawaiSchema, PegawaiUpdateSchema };
