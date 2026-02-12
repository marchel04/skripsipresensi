# 📋 DOKUMENTASI IMPLEMENTASI FITUR ABSENSI

## Ringkasan Fitur

Implementasi lengkap fitur-fitur absensi yang diminta dengan teknologi:
- **Backend**: Express.js + Prisma ORM
- **Frontend**: Next.js 15 + React 19 + Ant Design

### Fitur yang Diimplementasikan

#### 1. ✅ Dashboard Admin
- **KPI Stats**: Total pegawai, hadir, terlambat, izin, total jam kerja
- **Rekap Perbulan**: Tabel agregat data perbulan per pegawai
- **Filter Tanggal**: Melihat statistik berdasarkan tanggal tertentu

#### 2. ✅ Dashboard Pegawai (Beranda)
- **Info Hari Ini**: Jam masuk, jam pulang, status, jam terlambat, total jam kerja
- **Riwayat 10 Hari**: Tabel riwayat presensi dengan detail

#### 3. ✅ Presensi dengan Validasi
- ❌ Tidak bisa presensi jika sudah melewati batas masuk
- ❌ Tidak bisa presensi jika sudah ada izin yang disetujui hari ini
- ❌ Tidak bisa presensi 2x dalam sehari
- ✅ Auto-calculate jam terlambat dan jam kerja
- ✅ Form langsung klik presensi (tanpa pilih jam kerja terlebih dahulu - dipilih saat modal)

#### 4. ✅ Menu Izin
- **Rekap Izin**: Tabel rekap per pegawai dengan durasi
- **Pencarian Izin**: Filter by tanggal mulai, tanggal selesai, status
- **Detail Izin**: Perbulan dengan durasi dan alasan

#### 5. ✅ Menu Laporan Absensi
- **Pencarian**: By tanggal spesifik atau by bulan/tahun
- **Filter Pegawai**: Lihat data spesifik pegawai atau semua
- **Rekap Perbulan**: Agregat data per pegawai
- **Print**: Generate laporan untuk dicetak
- **Kolom Tambahan**: Jam terlambat, jam masuk, total jam kerja, status

---

## Perubahan Database

### Prisma Schema Updates

#### 1. Model `Pegawai` - Tambah 2 Kolom
```prisma
jam_masuk_custom    String?      // Jam masuk custom per pegawai (override jam kerja default)
jam_pulang_custom   String?      // Jam pulang custom per pegawai
```

#### 2. Model `Absensi` - Tambah 3 Kolom
```prisma
jam_terlambat       Int          // Menit terlambat
total_jam_kerja     Decimal      // Total jam kerja (dengan 2 desimal)
sudah_izin_hari_ini Boolean      // Flag untuk tracking izin hari ini
```

#### 3. Model Baru `RekapPrebulan`
```prisma
model RekapPrebulan {
  id_rekap          Int
  id_pegawai        Int
  tahun             Int
  bulan             Int
  total_hadir       Int
  total_terlambat   Int
  total_izin        Int
  total_alfa        Int
  total_jam_kerja   Decimal
  total_jam_terlambat Int
  
  @@unique([id_pegawai, tahun, bulan])
}
```

### SQL Migration
```sql
-- File: prisma/migrations/add_attendance_features/migration.sql
```

---

## Backend Implementation

### 1. Utility Functions (`src/utils/absenceCalculations.js`)

```javascript
// Menghitung selisih menit antara dua waktu (HH:mm format)
calculateMinuteDifference(timeStart, timeEnd) → Number

// Menghitung jam terlambat dalam menit
calculateLatenessMinutes(jamMasukSchedule, jamMasukActual) → Number

// Menghitung total jam kerja dengan memperhitungkan lateness
calculateWorkHours(jamMasuk, jamPulang, latenessMinutes) → Number

// Konversi waktu ke desimal jam
timeToDecimalHours(time) → Number

// Dapatkan jadwal kerja (custom atau default)
getWorkSchedule(pegawai, jamKerja) → Object

// Validasi helpers
isLate(jamMasukSchedule, jamMasukActual) → Boolean
isExceedsDeadline(jamMasukActual, batasMasuk) → Boolean
checkIfAlreadyCheckedInToday(idPegawai, tanggal, prisma) → Promise<Boolean>
checkIfAlreadyHasLeaveToday(idPegawai, tanggal, prisma) → Promise<Boolean>
```

### 2. Services

#### `DashboardService` (`src/services/dashboard.service.js`)
- `getAdminDashboardStats(tanggal)` - Ambil KPI stats admin
- `getAbsensiReport(filters)` - Ambil laporan dengan filter & rekap

#### Update `IzinService` (`src/services/izin.service.js`)
- `searchIzinService(filters)` - Cari izin dengan filter tanggal & status
- `getIzinRecapService(bulan, tahun)` - Rekap izin perbulan

#### Update `AbsensiService` (`src/services/absensi.service.js`)
- Enhanced `createAbsensiService()` dengan 4 validasi & auto-calculate
- Enhanced `updateAbsensiService()` dengan hitung jam kerja

### 3. Controllers

#### `DashboardController` (`src/controllers/dashboard.controller.js`)
- `getAdminDashboard()`
- `getAbsensiReport()`
- `printAbsensiReport()`

#### Update `IzinController` (`src/controllers/izin.controller.js`)
- `searchIzin()`
- `getIzinRecap()`

### 4. Routes

#### New: `src/routes/dashboard.router.js`
```javascript
GET    /dashboard                    // Admin dashboard stats
GET    /dashboard/laporan/absensi    // Laporan absensi
GET    /dashboard/laporan/absensi/cetak // Export print
```

#### Update: `src/routes/izin.router.js`
```javascript
GET    /izin/search     // Search izin
GET    /izin/recap      // Rekap izin
```

#### Update: `src/index.js`
- Register dashboard routes

---

## Frontend Implementation

### 1. API Helper (`app/lib/api.js`)

Centralized API calls ke backend dengan method:
- `dashboardApi.getAdminStats()`
- `dashboardApi.getAbsensiReport()`
- `dashboardApi.printAbsensiReport()`
- `absensiApi.createAbsensi()`
- `absensiApi.getTodayAbsensi()`
- `absensiApi.getAbsensiByPegawai()`
- `absensiApi.updateAbsensi()`
- `izinApi.searchIzin()`
- `izinApi.getIzinRecap()`

### 2. Components

#### `AdminDashboardStats.jsx` 
- 6 KPI stat cards (Total pegawai, hadir, terlambat, izin, jam kerja)
- Date picker untuk filter tanggal
- Tabel rekap perbulan
- Responsive design dengan Ant Design

#### `LaporanAbsensiComponent.jsx`
- Filter: Bulan, Tahun, Pegawai
- Tabel data absensi dengan 7 kolom
- Rekap per pegawai dengan totals
- Button print yang generate HTML table
- Pagination & scroll untuk mobile

#### `IzinComponent.jsx`
- 2 mode: Search & Recap
- Filter: Tanggal mulai, selesai, status, pegawai
- Tabel dengan durasi perhitungan otomatis
- Rekap dengan expand view untuk detail per pegawai
- Status badges dengan warna

#### `AbsenPegawaiComponent.jsx`
- Info hari ini: 4 stat cards (jam masuk, pulang, terlambat, jam kerja)
- Alert status (hadir/terlambat/belum presensi)
- Modal untuk pilih jam kerja saat check-in
- Button check-in & check-out
- Riwayat 10 hari terakhir dengan sortir otomatis

---

## Validasi Presensi (5 Point Check)

Saat pegawai click "Presensi Masuk":

```
1. ✅ Cek: Sudah ada presensi hari ini?
   - Jika ada → Error: "Anda sudah melakukan presensi hari ini"

2. ✅ Cek: Sudah ada izin disetujui hari ini?
   - Jika ada → Error: "Anda sudah memiliki izin yang disetujui hari ini"

3. ✅ Cek: Apakah melebihi batas masuk?
   - Jika melebihi → Error: "Presensi tidak dapat dilakukan setelah jam [batas_masuk]"

4. ✅ Calculate: Jam terlambat (menit)
   - Jika jam masuk > jam masuk schedule → status = "terlambat"
   - Simpan: jam_terlambat = selisih dalam menit

5. ✅ Calculate: Total jam kerja
   - Hitung: (jam pulang - jam masuk) - jam terlambat
   - Format: XX.XX (desimal)
   - Simpan: total_jam_kerja
```

---

## Flow Implementasi

### Backend Flow
1. User check-in → POST /api/absensi
2. Service validasi 5 point check
3. Auto-calculate jam terlambat & jam kerja
4. Return: Absensi record dengan status

### Frontend Flow
1. User klik "Presensi Masuk"
2. Modal popup pilih jam kerja
3. Frontend send ke backend dengan jam masuk saat ini
4. Backend respond dengan status & error handling
5. UI update dengan data terbaru

---

## Environment Setup

### Backend `.env`
```
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
JWT_SECRET="your_secret_key"
APP_ENV="development"
PORT=4000
ORIGIN="http://localhost:3000"
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## Testing Checklist

- [ ] Admin dashboard menampilkan 6 KPI stats
- [ ] Admin dapat filter laporan by bulan/tahun
- [ ] Admin dapat print laporan absensi
- [ ] Admin dapat search dan recap izin
- [ ] Pegawai dapat check-in dengan validasi
- [ ] Pegawai tidak bisa presensi 2x sehari
- [ ] Pegawai tidak bisa presensi jika ada izin
- [ ] Pegawai tidak bisa presensi setelah batas masuk
- [ ] Jam terlambat auto-calculate dengan benar
- [ ] Total jam kerja auto-calculate dengan benar
- [ ] UI responsive di mobile & desktop

---

## API Endpoints Summary

### Dashboard
- `GET /api/dashboard` - Admin stats KPI
- `GET /api/dashboard/laporan/absensi?bulan=X&tahun=Y` - Laporan with recap
- `GET /api/dashboard/laporan/absensi/cetak?...` - Export print

### Absensi
- `POST /api/absensi` - Check-in (with validation)
- `GET /api/absensi/today` - Today record
- `GET /api/absensi/pegawai/:id` - Personal history
- `PUT /api/absensi/pulang` - Check-out

### Izin
- `GET /api/izin/search?tanggalMulai=...&tanggalSelesai=...&status=...` - Search
- `GET /api/izin/recap?bulan=X&tahun=Y` - Recap monthly

---

## Next Steps untuk Production

1. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Build & Deploy Backend**
   ```bash
   npm run build
   npm start
   ```

3. **Build & Deploy Frontend**
   ```bash
   npm run build
   npm start
   ```

4. **Testing Coverage**
   - Unit tests untuk utility functions
   - Integration tests untuk API endpoints
   - E2E tests untuk user flows

5. **Performance Optimization**
   - Add caching untuk dashboard stats
   - Index optimization di database
   - Lazy load tables untuk large datasets

---

## Troubleshooting

### Issue: "Presensi tidak dapat dilakukan setelah jam X"
**Solusi**: Pastikan `batas_masuk` di `jam_kerja` sudah di-set dengan benar

### Issue: Jam terlambat tidak ter-calculate
**Solusi**: Pastikan `jam_masuk_custom` di pegawai null (gunakan default) atau ter-set dengan benar

### Issue: Total jam kerja = 0
**Solusi**: Pastikan `jam_pulang` sudah ter-update (check-out sudah dilakukan)

---

**Dokumentasi ini last updated: 2 Feb 2026**
