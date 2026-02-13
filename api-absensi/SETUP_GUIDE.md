# 🚀 SETUP GUIDE - Fitur Absensi Baru

## Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm atau pnpm
- Git

---

## Setup Backend (api-absensi)

### Step 1: Install Dependencies
```bash
cd api-absensi
npm install
# atau
pnpm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/absensi_db"
JWT_SECRET="your_secret_key_here"
APP_ENV="development"
PORT=4000
ORIGIN="http://localhost:3000"
```

### Step 3: Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migration (create tables & columns)
npx prisma migrate deploy

# Atau jika pertama kali setup
npx prisma db push
```

### Step 4: Verify Schema
```bash
# Check Prisma schema
npx prisma studio
```

Buka browser ke `http://localhost:5555` untuk melihat database visual

### Step 5: Start Backend
```bash
npm run dev
```

Server akan run di `http://localhost:4000`

Verifikasi endpoints:
```bash
curl http://localhost:4000/api/dashboard
# Harusnya error 401 (authentication required)
```

---

## Setup Frontend (aplikasi-absensi-nextjs)

### Step 1: Install Dependencies
```bash
cd aplikasi-absensi-nextjs
npm install
# atau
pnpm install
```

### Step 2: Setup Environment
```bash
# Buat file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
```

Edit `.env.local` jika perlu:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Step 3: Start Development Server
```bash
npm run dev
```

Frontend akan run di `http://localhost:3000`

### Step 4: Verify Setup
- Buka `http://localhost:3000` di browser
- Harusnya redirect ke login page
- Cek console browser untuk network errors

---

## Integrasi Keseluruhan

### 1. Login Flow
```
1. User ke http://localhost:3000
2. Redirect ke /login
3. Input credentials
4. Backend validasi & return JWT
5. Frontend simpan token di cookie/localStorage
6. Redirect ke /beranda atau /dashboard
```

### 2. Dashboard Admin Flow
```
1. Navigate ke http://localhost:3000/dashboard
2. Frontend fetch GET /api/dashboard
3. Backend return KPI stats
4. UI render 6 stat cards + tabel rekap
5. User filter by tanggal
6. Frontend fetch dengan filter param
```

### 3. Presensi Flow
```
1. Pegawai navigate ke /absen
2. Lihat status hari ini (fetch GET /api/absensi/today)
3. Klik "Presensi Masuk" → Modal popup
4. Pilih jam kerja → Submit
5. Frontend POST /api/absensi
6. Backend validasi 5 point + calculate
7. Return status & error jika ada
8. UI update dengan data terbaru
```

### 4. Laporan Flow
```
1. Admin navigate ke /dashboard/laporan
2. Set filter (bulan, tahun, pegawai)
3. Frontend fetch GET /api/dashboard/laporan/absensi?...
4. Backend return data + recap
5. UI render tabel & rekap
6. Klik Print → generate HTML & browser print dialog
```

---

## Database Schema Check

Pastikan kolom berikut sudah ada:

### Table: `pegawai`
```sql
ALTER TABLE pegawai ADD COLUMN jam_masuk_custom TIME NULL;
ALTER TABLE pegawai ADD COLUMN jam_pulang_custom TIME NULL;
```

### Table: `absensi`
```sql
ALTER TABLE absensi ADD COLUMN jam_terlambat INT DEFAULT 0;
ALTER TABLE absensi ADD COLUMN total_jam_kerja DECIMAL(5,2) DEFAULT 0;
ALTER TABLE absensi ADD COLUMN sudah_izin_hari_ini BOOLEAN DEFAULT FALSE;
```

### Table: `rekap_prebulan` (Baru)
```sql
CREATE TABLE rekap_prebulan (
  id_rekap INT AUTO_INCREMENT PRIMARY KEY,
  id_pegawai INT NOT NULL,
  tahun INT NOT NULL,
  bulan INT NOT NULL,
  total_hadir INT DEFAULT 0,
  total_terlambat INT DEFAULT 0,
  total_izin INT DEFAULT 0,
  total_alfa INT DEFAULT 0,
  total_jam_kerja DECIMAL(8,2) DEFAULT 0,
  total_jam_terlambat INT DEFAULT 0,
  UNIQUE KEY unique_rekap (id_pegawai, tahun, bulan),
  FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);
```

Verifikasi:
```bash
mysql -u root -p absensi_db
DESCRIBE pegawai;
DESCRIBE absensi;
DESCRIBE rekap_prebulan;
```

---

## Troubleshooting Setup

### Issue: "connect ECONNREFUSED 127.0.0.1:3306"
**Solusi**: MySQL tidak running
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Issue: "P1000: Authentication failed"
**Solusi**: DATABASE_URL credentials salah
```bash
# Test connection
mysql -u root -p -h localhost
# Enter password
```

### Issue: "prisma studio" command not found
**Solusi**: Install prisma globally
```bash
npm install -g @prisma/cli
```

### Issue: Frontend tidak bisa fetch dari backend
**Solusi**: CORS issue
- Pastikan backend running di port 4000
- Pastikan `.env` ORIGIN benar
- Check browser console untuk network errors

### Issue: "Cannot find module '@/app/lib/api'"
**Solusi**: Path alias belum configured
- Check `tsconfig.json` atau `jsconfig.json`
- Pastikan `@/*` pointing ke `./app/*`

---

## Running Tests

### Backend Tests
```bash
cd api-absensi
npm run test
```

### Frontend Tests
```bash
cd aplikasi-absensi-nextjs
npm run test
```

---

## Production Deployment

### Backend (Vercel, Railway, atau VPS)
```bash
# Build
npm run build

# Start
npm start
```

Set environment variables di platform:
- DATABASE_URL
- JWT_SECRET
- APP_ENV=production
- ORIGIN=https://yourdomain.com

### Frontend (Vercel atau Netlify)
```bash
npm run build
npm start
```

Set environment variables:
- NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

---

## Quick Commands Reference

```bash
# Backend development
cd api-absensi && npm run dev

# Frontend development  
cd aplikasi-absensi-nextjs && npm run dev

# Check database
npx prisma studio

# Database sync
npx prisma db push

# Migration create new
npx prisma migrate dev --name "migration_name"

# Reset database (WARNING: data loss)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

---

## Logs & Debugging

### Backend Logs
```bash
# Run dengan debug
DEBUG=* npm run dev
```

### Frontend Browser DevTools
- Open DevTools (F12)
- Network tab untuk check API calls
- Console untuk errors
- Application tab untuk cookies/localStorage

### Database Logs
```bash
# Enable query logging di Prisma
# .env
# DATABASE_URL="mysql://...?debug=true"
```

---

## Verifikasi Lengkap

Cek semua endpoint working:

```bash
# 1. Check backend alive
curl http://localhost:4000

# 2. Check login endpoint
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"1001","password":"password"}'

# 3. Check dashboard (need token)
curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Frontend check
curl http://localhost:3000
```

---

## Performance Tips

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_pegawai_tanggal ON absensi(id_pegawai, tgl_absensi);
   CREATE INDEX idx_status ON absensi(status);
   ```

2. **Caching**
   - Dashboard stats cache per hour
   - Laporan cache per session
   - Izin data refresh on filter change

3. **Pagination**
   - Table default 10 rows
   - Support load more for riwayat

4. **Lazy Loading**
   - Riwayat load on demand
   - Laporan load dengan filter

---

**Setup Guide Version**: 1.0  
**Last Updated**: 2 Feb 2026
