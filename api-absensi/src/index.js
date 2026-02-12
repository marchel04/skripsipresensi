const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

// Routes
const loginRouter = require("./routes/login.router.js");
const divisiRouter = require("./routes/divisi.router.js");
const authRouter = require("./routes/auth.router.js");
const pegawaiRouter = require("./routes/pegawai.router.js");
const jamKerjaRouter = require("./routes/jamKerja.router.js");
const absensiRouter = require("./routes/absensi.router.js");
const izinRouter = require("./routes/izin.router.js");
const rekapRouter = require("./routes/rekap.router.js");
const dashboardRouter = require("./routes/dashboard.router.js");

// Middlewares
const errorHandler = require("./middleware/errorHandler.js");
const { requestLogger } = require("./middleware/requestLoggerMiddleware.js");
const notFoundHandler = require("./middleware/notFoundMiddleware.js");

dotenv.config();

const app = express();

const corsOptions = {
  origin:
    process.env.APP_ENV === "development"
      ? "http://localhost:3000" // frontend localhost
      : process.env.ORIGIN, // production
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middlewares
app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// app.use("/uploads/aplicant", express.static("src/storage/uploads/aplicant"));
app.use("/storage", express.static(path.resolve("storage")));

// Routes
app.use("/api/login", loginRouter);
app.use("/api/auth", authRouter);
app.use("/api/pegawai", pegawaiRouter);
app.use("/api/divisi", divisiRouter);
app.use("/api/jam-kerja", jamKerjaRouter);
app.use("/api/absensi", absensiRouter);
app.use("/api/izin", izinRouter);
app.use("/api/rekap", rekapRouter);
app.use("/api/dashboard", dashboardRouter);

// Error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
