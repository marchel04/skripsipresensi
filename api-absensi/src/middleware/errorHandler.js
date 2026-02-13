function errorHandler(err, req, res, next) {
    if (err.name === "ZodError" && Array.isArray(err.errors)) {
        console.log("zod ERROR detail: ", err);
        return res.status(400).json({
            success: false,
            error: {
                message: err.errors.map((e) => e.message).join(", "),
            },
            message: "Validasi gagal",
        });
    }

    // Handle custom errors (e.g., dari service layer)
    if (err.message) {
        console.error("ERROR:", err.message);
        return res.status(400).json({
            success: false,
            error: {
                message: err.message,
            },
            message: err.message,
        });
    }

    console.error("ERROR:", err);
    res.status(500).json({
        success: false,
        error: {
            message: "Terjadi kesalahan pada server",
        },
        message: "Terjadi kesalahan pada server",
    });
}

module.exports = errorHandler;
