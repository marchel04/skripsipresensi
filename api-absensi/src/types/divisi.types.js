const { z } = require("zod");

const DivisiSchema = z.object({
    id_divisi: z.number().int().positive().optional(),
    nama_divisi: z.string().min(1).max(191),
});

const DivisiUpdateSchema = DivisiSchema.partial();

module.exports = { DivisiSchema, DivisiUpdateSchema };