# Ringkasan Middleware

File-file middleware di folder ini dikembangkan untuk tujuan berikut:

- **`authMiddleware.js` / `protectAuth`**: memverifikasi otentikasi pengguna (mis. JWT di cookie/header), menolak request jika tidak terotentikasi, dan menambahkan data pengguna ke `req`.
- **`roleMiddleware.js` / `isAdmin`**: otorisasi berbasis peran — membatasi akses rute hanya untuk admin atau role tertentu.
- **`requestLoggerMiddleware.js`**: mencatat informasi request (metode, path, durasi) untuk debugging dan monitoring.
- **`errorHandler.js`**: menangani error terpusat, memformat respons error dan menghindari crash server pada error async.
- **`notFoundMiddleware.js`**: menangani route yang tidak ditemukan (404) dengan respons konsisten.
- **`uploadIzinmiddleware.js`**: middleware khusus untuk menangani upload file izin (validasi file, penyimpanan sementara, dsb.).
- **`validateNIKMiddleware.js`**: validasi input `NIK` (format, panjang, atau pengecekan bisnis lain) sebelum mencapai controller.

Panduan singkat penggunaan:

- Daftarkan middleware global di `src/index.js` untuk logger, error handler, dan not-found.
- Gunakan `protectAuth` dan `isAdmin` pada route-level untuk proteksi rute:

- Contoh: `router.get('/admin', protectAuth, isAdmin, adminController)`

- Letakkan middleware yang memproses body/file (seperti `uploadIzinmiddleware`) sebelum handler yang membutuhkan file tersebut.