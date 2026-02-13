const { z } = require("zod");

const AbsensiSchema = z.object({
    id_pegawai: z.number().int().positive().optional(),
    tgl_absensi: z.coerce.date(),
    jam_masuk: z.string().min(1).max(191).optional(),
    jam_pulang: z.string().min(1).max(191).optional(),
    status: z.enum(["hadir", "terlambat", "pulang_cepat", "alfa"]).optional(),
    id_jam: z.number().int().positive().optional(),
});

const AbsensiUpdateSchema = AbsensiSchema.partial();

module.exports = { AbsensiSchema, AbsensiUpdateSchema };