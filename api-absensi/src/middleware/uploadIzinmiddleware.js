const multer = require("multer");
const { uploadDocumentIzin } = require("../utils/multerUploadHandler");

const uploadIzinMiddleware = (req, res, next) => {
    uploadDocumentIzin.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "Ukuran file maksimal 2MB",
                });
            }
        }

        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        next();
    });
};

module.exports = { uploadIzinMiddleware };
