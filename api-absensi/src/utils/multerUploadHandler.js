// src/utils/multerUploadHandler.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// File field: cv, id_card, certificate, photo, transcript
const DocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const idPegawai = req.user?.id_pegawai;
      if (!idPegawai) return cb(new Error("Unauthorized"), null);

      const dir = path.join(
        __dirname,
        "../../storage/uploads/users/documents",
      );
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, null);
    }
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    cb(null, `izin_${timestamp}${path.extname(file.originalname)}`);
  },
});

// File field: file, type
const ProfilePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const dir = path.join(__dirname, "../../storage/uploads/users/profile");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: function (req, file, cb) {
    // Simpan dengan nama asli
    const random = Math.floor(Math.random() * 1000);
    const timestamp = Date.now();
    cb(
      null,
      "profile_" +
        file.fieldname +
        "_" +
        timestamp +
        "_" +
        random +
        path.extname(file.originalname),
    );
  },
});

const uploadDocumentIzin = multer({
  storage: DocumentStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB/file
});

const uploadprofilePic = multer({
  storage: ProfilePicStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB/file
});

module.exports = { uploadDocumentIzin, uploadprofilePic };
