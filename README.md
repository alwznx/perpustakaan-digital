# 📚 Perpustakaan Digital Kampus — *Fullstack Edisi Sultan*

Aplikasi web perpustakaan modern dengan manajemen inventaris level industri, sistem peminjaman cerdas, modul komunitas, dan Dashboard Admin super lengkap.
Dibangun menggunakan Fullstack JavaScript Tech Stack yang digunakan di dunia profesional.

---

## ✨ Fitur Utama (Kelas Profesional)

Aplikasi ini melayani **dua peran:**

* **Member (Pembaca)**
* **Admin (Pustakawan)**

Semua fitur sudah terintegrasi dengan database Supabase dan dibuat 100% real-time.

---

## 1. 🔐 Fitur Dasar & Identitas

| Fitur                     | Deskripsi                                                      | Status |
| ------------------------- | -------------------------------------------------------------- | ------ |
| **Login & Register**      | Sistem autentikasi menggunakan Supabase Auth (email/password). | ✅      |
| **Kartu Anggota Digital** | Generate ID Member unik + QR Code yang dapat di-download.      | ✅      |
| **Manajemen Profil**      | Ganti nama, upload avatar, dan personalisasi akun.             | ✅      |
| **Notifikasi In-App**     | Sistem lonceng untuk pesan Pinjam, Kembali, atau Telat.        | ✅      |

---

## 2. 📖 Logika Bisnis & Peminjaman

| Fitur                     | Deskripsi                                                       | Status |
| ------------------------- | --------------------------------------------------------------- | ------ |
| **Batas Peminjaman**      | Max. 3 buku per user. Pinjaman ke-4 otomatis ditolak.           | ✅      |
| **Sistem Denda Otomatis** | Hitung denda Rp1.000/hari untuk keterlambatan, realtime.        | ✅      |
| **Stok Real-time**        | Stok berkurang saat dipinjam dan bertambah saat dikembalikan.   | ✅      |
| **Jatuh Tempo**           | Tanggal kembali otomatis (7 hari) + status TELAT bila melebihi. | ✅      |

---

## 3. 🌟 Modul Komunitas & Katalog

| Fitur                            | Deskripsi                                               | Status |
| -------------------------------- | ------------------------------------------------------- | ------ |
| **Papan Klasemen (Leaderboard)** | Top Pembaca & Buku Terlaris (menggunakan SQL RPC).      | ✅      |
| **Wishlist & Review**            | Member dapat favoritkan buku & beri rating + komentar.  | ✅      |
| **Pencarian & Filter**           | Search real-time dan filter berdasarkan kategori.       | ✅      |
| **Pagination & Skeleton**        | Halaman katalog lebih ringan & estetis (loading halus). | ✅      |

---

## 4. 🛠 Dashboard Admin (Reporting & Control)

| Fitur                    | Deskripsi                                  | Status |
| ------------------------ | ------------------------------------------ | ------ |
| **Dashboard Analytics**  | Grafik distribusi koleksi buku (Recharts). | ✅      |
| **Export Excel**         | Download laporan peminjaman aktif (.xlsx). | ✅      |
| **Manajemen Inventaris** | Tambah, edit, hapus buku + update stok.    | ✅      |
| **Force Return**         | Admin bisa menarik paksa buku yang telat.  | ✅      |

---

## 5. 🎨 Pengalaman Pengguna (UI/UX)

* 🌙 **Dark Mode** dengan penyimpanan localStorage
* ✨ **Animasi Transisi Halus** (Framer Motion)
* 📱 **Responsif Penuh** (Desktop, Tablet, Mobile)
* 🍔 **Menu Hamburger** untuk tampilan mobile
* ⚡ **Interaksi cepat** dengan React Hot Toast
* 💨 **Tampilan modern** berbasis Tailwind CSS

---

## 🛠️ Tech Stack

| Kategori         | Teknologi                                  | Fungsi                                  |
| ---------------- | ------------------------------------------ | --------------------------------------- |
| **Frontend**     | React.js, Vite                             | Kerangka aplikasi modern & super cepat  |
| **Backend/BaaS** | Supabase (Auth, PostgreSQL, Storage)       | Database, autentikasi, penyimpanan file |
| **UI/Animasi**   | Tailwind CSS, Framer Motion, Recharts      | Styling, animasi, visualisasi data      |
| **Utility**      | SheetJS (XLSX), react-qr-code, html2canvas | Export Excel, QR Code, download kartu   |

---

## 🚀 Cara Menjalankan Proyek (Lokal)

### 1️⃣ Clone Repository & Instalasi

```bash
git clone https://github.com/username/perpustakaan-digital.git
cd perpustakaan-digital
npm install
```

> Catatan: Ganti URL GitHub sesuai repositori kamu.

---

### 2️⃣ Konfigurasi Environment

Buat file **`.env.local`** di root project:

```
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

### 3️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi dapat diakses di:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🧑‍🏫 Tentang Developer

Proyek ini dikembangkan oleh **Alwi**,
Mahasiswa **Pendidikan Informatika** yang membangun aplikasi ini dari nol melalui proses mentoring dan eksplorasi konsep Fullstack modern.

Dibuat dengan semangat belajar dan dedikasi untuk menciptakan **perpustakaan digital kelas profesional**. 🚀📚

---

## ⭐ Lisensi

Proyek ini bebas kamu gunakan untuk:

* Portofolio
* Pengembangan lebih lanjut

Tidak diizinkan menjual aplikasi ini tanpa izin pemilik.

---
