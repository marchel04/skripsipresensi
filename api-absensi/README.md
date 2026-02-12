# 🚀 Setup Project

Panduan untuk menjalankan proyek ini di lingkungan lokal.

## ⚙️ Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/username/nama-repo.git

2. **Masuk ke folder project**
   ```bash
   cd nama_folder
   
3. **Buat file .env**
   ```bash
   APP_ENV="development"
   DATABASE_URL="mysql://test:test@192.168.10.2:3306/waleta_career_new"
   PORT=4000
   JWT_SECRET=
   ORIGIN=https://your-production-website.com

4. **Install dependencies**
   ```bash
   npm install

5. **Migrasi prisma**
   ```bash
   npx prisma migrate dev --name nama_migrasi

6. **Generate prisma**
   ```bash
   npx prisma generate

7. **Jalankan Project**
   ```bash
   npm run dev
