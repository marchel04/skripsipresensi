const { z } = require("zod");

const IzinSchema = z.object({
  tgl_mulai: z.string().datetime(),
  tgl_selesai: z.string().datetime(),
  alasan: z.string().max(191).optional(),
  status_izin: z.enum(["pending", "disetujui", "ditolak"]).optional(),
});

const IzinUpdateSchema = IzinSchema.partial();

module.exports = { IzinSchema, IzinUpdateSchema };
