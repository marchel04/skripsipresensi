const { z } = require("zod");

const LoginSchema = z.object({
    nip: z
        .string()
        .min(3, { message: "NIP minimal 3 karakter" })
        .max(50, { message: "NIP maksimal 50 karakter" }),

    password: z
        .string()
        .min(8, { message: "Password minimal 8 karakter" }),
});

const LoginUpdateSchema = LoginSchema.partial();

module.exports = {
    LoginSchema,
    LoginUpdateSchema,
};
