# Panduan Deploy UMKM Store — Dari Nol Sampai Online

Ikuti urutan ini persis. Total waktu kira-kira 30-45 menit untuk yang pertama kali.

---

## Bagian 1: Setup Database (Neon)

1. Buka https://neon.tech → **Sign up** (bisa pakai akun GitHub/Google, gratis).
2. Setelah masuk dashboard, klik **Create a project**.
   - Nama project: bebas, misal `umkm-store`
   - Region: pilih **Singapore** (paling dekat ke Indonesia)
3. Setelah project dibuat, Neon akan menampilkan **Connection String**. Bentuknya seperti:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   **Copy connection string ini** — akan dipakai di dua tempat (lokal & Vercel).

---

## Bagian 2: Jalankan di Komputer Lokal Dulu (Wajib, untuk isi data awal)

Buka folder project ini di terminal/VS Code, lalu:

1. **Install dependency:**
   ```bash
   npm install
   ```

2. **Buat file `.env`** (copy dari `.env.example`, lalu isi):
   ```bash
   cp .env.example .env
   ```
   Buka file `.env`, isi:
   - `DATABASE_URL` → paste connection string dari Neon
   - `AUTH_SECRET` → generate string acak dengan menjalankan `openssl rand -base64 32` di terminal, lalu paste hasilnya

3. **Kirim skema database ke Neon** (membuat semua tabel):
   ```bash
   npm run db:push
   ```
   Jika muncul pertanyaan konfirmasi, pilih **Yes/create table**.

4. **Isi data awal (produk, kategori, admin, dll):**
   ```bash
   npm run db:seed
   ```
   Di akhir proses akan muncul kredensial login:
   ```
   Admin    -> email: admin@umkmstore.id     | password: admin123
   Customer -> email: customer@umkmstore.id  | password: customer123
   ```
   **Catat ini**, dan segera ganti password admin setelah login pertama kali nanti.

5. **Jalankan di lokal untuk cek semua berjalan normal:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` → pastikan produk muncul, coba login sebagai admin di `/login`, cek `/admin/dashboard` bisa diakses.

---

## Bagian 3: Push ke GitHub

1. Buat repository baru di https://github.com/new (boleh private).
2. Di terminal folder project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   > File `.env` **tidak akan ikut ter-push** karena sudah ada di `.gitignore` bawaan Next.js — ini benar dan aman, karena kredensial tidak boleh ada di GitHub.

---

## Bagian 4: Deploy ke Vercel

1. Buka https://vercel.com → **Sign up** pakai akun GitHub yang sama.
2. Klik **Add New → Project**, pilih repository yang baru di-push tadi.
3. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon yang sama seperti di `.env` |
   | `AUTH_SECRET` | string acak yang sama seperti di `.env` |
   | `NEXT_PUBLIC_APP_URL` | isi sementara dengan `https://nama-project.vercel.app` (bisa disesuaikan setelah deploy pertama) |
4. Klik **Deploy**. Tunggu 2-4 menit.
5. Setelah selesai, Vercel memberi URL publik seperti `https://umkm-store-xxxx.vercel.app` — **website sudah online dan bisa diakses siapa saja.**

---

## Bagian 5: (Opsional) Pasang Domain Sendiri

1. Beli domain (contoh: Niagahoster, Rumahweb, Namecheap, dll) — misal `tokokamu.com`.
2. Di dashboard Vercel project → tab **Settings → Domains** → masukkan `tokokamu.com` → **Add**.
3. Vercel akan menampilkan 1-2 DNS record (biasanya tipe `A` atau `CNAME`) yang perlu ditambahkan di panel domain kamu.
4. Masuk ke panel provider domain → menu DNS → tambahkan record persis sesuai instruksi Vercel.
5. Tunggu 10 menit - 24 jam untuk propagasi DNS. Setelah aktif, Vercel otomatis mengurus SSL/HTTPS gratis.

---

## Setelah Online: Checklist Keamanan

- [ ] Login sebagai admin, ganti password default `admin123` (lewat fitur ganti password — lihat catatan di bawah)
- [ ] Hapus/nonaktifkan akun contoh `customer@umkmstore.id` jika tidak diperlukan
- [ ] Jangan pernah commit file `.env` ke GitHub
- [ ] Simpan `AUTH_SECRET` dan `DATABASE_URL` di tempat aman (password manager)

> **Catatan:** fitur "ganti password dari halaman profil" belum dibuat di tahap ini. Untuk sementara, ganti password admin langsung lewat Neon SQL Editor, atau minta dibuatkan fitur ganti password di sesi berikutnya.

---

## Setiap Kali Update Website Setelah Ini

```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
Vercel otomatis mendeteksi push baru dan mendeploy ulang (butuh 1-3 menit).

Kalau ada perubahan skema database (menambah kolom/tabel baru), jalankan `npm run db:push` lagi dari lokal setelah mengubah `src/db/schema.ts`.
