# 📄 Layanan Surat Digital RT (Sistem Surat-Menyurat Rukun Tetangga)

Aplikasi web modern berbasis **Serverless** untuk pengelolaan dan penerbitan surat-menyurat resmi tingkat **Rukun Tetangga (RT)** dan **Rukun Warga (RW)**. Dibangun menggunakan **React**, **Vite**, **Tailwind CSS**, database cloud **Supabase**, dan siap di-hosting secara gratis di **GitHub Pages**.

---

## 🌟 Fitur Utama

1. **Format Surat Resmi Siap Cetak (Kertas A4)**:
   - **Surat Pengantar RT (Umum)**: Untuk pengurusan SKCK di Polsek, BPJS, perbankan, dll.
   - **Surat Pengantar KTP & KK**: Permohonan KTP pemula 17 tahun, penggantian KTP rusak/hilang, penerbitan KK baru.
   - **Surat Keterangan Domisili**: Menerangkan tempat tinggal warga / domisili usaha.
   - **Surat Keterangan Kematian**: Dilengkapi rincian tanggal, waktu, tempat kematian, dan data pelapor/ahli waris.
   - **Surat Keterangan Usaha (SKU)**: Untuk pengajuan KUR bank atau izin usaha mikro di wilayah RT.
   - **Surat Keterangan Tidak Mampu (SKTM)**: Keperluan beasiswa pendidikan / KIP Kuliah / keringanan biaya.
   - **Surat Pengantar Pindah / Datang**: Keterangan perpindahan domisili warga antar RT/RW/Kelurahan.

2. **Kop Surat & Profil RT Fleksibel**:
   - Nomor RT, RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos.
   - Alamat Sekretariat & Kontak WhatsApp Pengurus RT.
   - Nama Ketua RT, NIK, serta dukungan logo & cap stempel digital.

3. **Sistem Penomoran Surat Otomatis**:
   - Format standar administrasi: `{nomor}/RT.{rt}/RW.{rw}/{bulan_romawi}/{tahun}` (contoh: `005/RT.005/RW.012/X/2026`).
   - Penomoran otomatis berurutan (auto-increment) yang aman dari duplikasi.

4. **Verifikasi Keaslian Dokumen via QR Code**:
   - Setiap surat memiliki kode unik dan QR Code verifikasi.
   - Pihak Kelurahan, Kecamatan, atau instansi lain cukup memindai QR Code untuk memastikan surat tersebut asli dan terdaftar di buku administrasi RT.

5. **Buku Induk Kependudukan Warga RT**:
   - Manajemen data warga (NIK, No. KK, Nama, TTL, Agama, Pekerjaan, Alamat, Status Tinggal).
   - Fitur pilih data warga sekali klik pada formulir surat agar tidak perlu mengetik ulang.

6. **Buku Arsip & Ekspor Data**:
   - Pencarian surat berdasarkan nama pemohon, NIK, atau nomor surat.
   - Filter per jenis surat dan tanggal.
   - Cetak ulang dokumen kapan saja dan fitur ekspor riwayat ke file CSV/Excel.

7. **Sistem Keamanan Akses Terbatas (OTP Warga & PIN Admin)**:
   - **Login OTP Warga**: Akses portal surat dibatasi hanya untuk warga yang telah diberikan kode OTP 6-digit oleh Ketua RT/Pengurus.
   - **Kirim via WhatsApp**: Pengurus RT dapat membuat OTP dan membagikannya langsung ke WhatsApp warga lengkap dengan tautan sekali klik (`?otp=XXXXXX`).
   - **Autofill Otomatis**: Jika OTP dikaitkan dengan NIK/Nama warga, formulir surat otomatis terisi identitas warga tersebut.
   - **Masa Berlaku Fleksibel**: Pengurus RT dapat mengatur masa aktif OTP (24 jam, 7 hari, 30 hari, atau 1x pakai).
   - **PIN Pengurus RT (Admin)**: Akses penuh untuk Ketua RT/Sekretaris mengelola profil RT, buku warga, dan seluruh riwayat surat.

8. **Arsitektur Serverless & Mode Hybrid**:
   - **Dapat langsung digunakan tanpa setup (Mode Demo / LocalStorage)**.
   - **Dapat dihubungkan ke Supabase** untuk sinkronisasi database cloud multi-pengurus.

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
- Node.js (versi 18 ke atas) & npm

### Langkah Menjalankan:
```bash
# 1. Masuk ke direktori proyek
cd "RT Dokumen"

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```
Buka browser pada alamat `http://localhost:3000`.

---

## ☁️ Panduan Setup Database Supabase (Gratis)

1. Buat akun atau login di [supabase.com](https://supabase.com).
2. Buat proyek baru (*New Project*). Beri nama misalnya `rt-surat-dokumen`.
3. Buka menu **SQL Editor** pada panel kiri dashboard Supabase.
4. Buka file [`supabase/schema.sql`](supabase/schema.sql) pada repositori ini, salin seluruh isinya, lalu tempelkan ke SQL Editor Supabase dan klik tombol **Run**.
5. Buka menu **Project Settings > API**, lalu salin:
   - **Project URL**
   - **anon public API key**
6. Hubungkan ke aplikasi dengan salah satu cara berikut:
   - **Melalui Tampilan Web**: Buka menu **Pengaturan RT > Database Supabase** di aplikasi, masukkan URL dan Anon Key, klik *Uji Koneksi* lalu *Simpan & Terapkan*.
   - **Melalui File Environment**: Buat file `.env` di direktori proyek:
     ```env
     VITE_SUPABASE_URL=https://proyek-anda.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
     ```

---

## 🌐 Panduan Deploy ke GitHub Pages

Proyek ini sudah dilengkapi file workflow otomatis di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Langkah Deploy:
1. Buat repositori baru di GitHub (misalnya `surat-rt`).
2. Hubungkan folder lokal ke repositori GitHub:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi aplikasi surat-menyurat RT"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-anda>.git
   git push -u origin main
   ```
3. Buka repositori Anda di GitHub:
   - Masuk ke tab **Settings > Pages**.
   - Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**.
4. (Opsional) Jika ingin menyimpan kredensial Supabase di GitHub Actions:
   - Masuk ke **Settings > Secrets and variables > Actions**.
   - Tambahkan Secret:
     - `VITE_SUPABASE_URL` : URL proyek Supabase Anda.
     - `VITE_SUPABASE_ANON_KEY` : Anon Key Supabase Anda.
5. GitHub Actions akan secara otomatis membangun (*build*) dan mempublikasikan aplikasi ke alamat:  
   `https://<username>.github.io/<repo-anda>/`

---

## 📂 Struktur Direktori Proyek

```
RT Dokumen/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD otomatis ke GitHub Pages
├── public/
│   └── 404.html              # Fallback redirect untuk SPA di GitHub Pages
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx     # Statistik, pintasan surat, dan aktivitas terkini
│   │   ├── SettingsModal.jsx # Form konfigurasi RT & koneksi Supabase
│   │   ├── SuratForm.jsx     # Generator pembuatan surat & input data
│   │   ├── SuratList.jsx     # Arsip surat, filter pencarian & ekspor CSV
│   │   ├── SuratPreview.jsx  # Tata letak lembar cetak standar A4 & QR code
│   │   ├── VerificationPage.jsx # Halaman publik validasi QR Code surat
│   │   └── WargaManager.jsx  # Buku Induk Kependudukan warga RT
│   ├── utils/
│   │   └── helpers.js        # Format tanggal Indo, romawi, generator nomor & QR
│   ├── App.jsx               # Komponen root & navigasi responsif
│   ├── index.css             # Konfigurasi Tailwind v4 & aturan cetak A4
│   ├── main.jsx              # Entry point React 19
│   └── supabaseClient.js     # Adaptor database Supabase & fallback LocalStorage
├── supabase/
│   └── schema.sql            # Skrip SQL tabel, index, RLS, dan fungsi auto-number
├── index.html                # Dokumen HTML utama
├── package.json              # Dependensi proyek
├── vite.config.js            # Konfigurasi Vite & base path relatif GitHub Pages
└── README.md
```

---

## 🖨️ Tips Pencetakan Dokumen Resmi
- Pada dialog cetak peramban (*Print Dialog* / `Ctrl+P` / `Cmd+P`):
  - **Ukuran Kertas**: Pilih **A4**.
  - **Margin**: Pilih **Default** atau **None** (margin sudah diatur otomatis via CSS naskah dinas).
  - **Header and Footer**: Hilangkan centang agar URL web dan tanggal browser tidak ikut tercetak di atas dokumen.
  - **Background Graphics**: Centang agar stempel digital dan garis kop surat tercetak dengan jelas.

