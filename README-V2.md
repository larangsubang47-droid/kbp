# 📋 LAPORAN PRODUKSI AIR BERSIH - VERSI 2.0

## 🎯 FITUR BARU YANG DITAMBAHKAN

### ✅ 1. SAVE DRAFT (Simpan Sementara)
- **Lokasi penyimpanan**: LocalStorage browser (offline)
- **Cara kerja**: 
  - Klik tombol "💾 Save Draft"
  - Data disimpan di browser dengan key `draft_TANGGAL`
  - Bisa ditutup dan dilanjutkan kapan saja
  - Data tersimpan per tanggal
- **Kegunaan**: Bisa input data bertahap, tidak perlu selesai sekaligus

### ✅ 2. SUBMIT FINAL (Kirim ke GDrive)
- **Lokasi penyimpanan**: Google Drive & Google Sheets
- **Cara kerja**:
  - Setelah data lengkap, klik "📤 Submit Final ke GDrive"
  - Konfirmasi: "Data tidak bisa diubah lagi"
  - Data dikirim ke server
  - Draft otomatis terhapus
- **Kegunaan**: Data final yang sudah pasti

### ✅ 3. AUTO SHEET PER HARI
- **Format sheet**: `Laporan_2026_01_28` (ganti per hari)
- **Cara kerja**:
  - Setiap tanggal berbeda = sheet baru
  - Data untuk hari yang sama ditambahkan ke sheet yang sama
  - 1 sheet = 1 hari
- **Contoh**:
  ```
  Sheet: Laporan_2026_01_28
  - Laporan pagi (submit jam 10:00)
  - Laporan sore (submit jam 18:00)
  - Semua dalam 1 sheet
  ```

### ✅ 4. AUTO SPREADSHEET PER BULAN
- **Format nama**: `Laporan Produksi Air Bersih - 2026-01`
- **Cara kerja**:
  - Setiap bulan baru = spreadsheet baru
  - Di dalam spreadsheet ada sheet Index + sheet harian
- **Struktur folder Google Drive**:
  ```
  📁 Folder Google Drive
    📊 Laporan Produksi Air Bersih - MASTER (untuk users)
    📊 Laporan Produksi Air Bersih - 2026-01 (Januari 2026)
       📄 Index Laporan
       📄 Laporan_2026_01_28
       📄 Laporan_2026_01_29
       📄 Activity Logs
    📊 Laporan Produksi Air Bersih - 2026-02 (Februari 2026)
       📄 Index Laporan
       📄 Laporan_2026_02_01
       📄 ...
    📁 Laporan JSON - 2026-01 (file JSON backup)
    📁 Laporan JSON - 2026-02
  ```

---

## 📂 FILE-FILE YANG DIMODIFIKASI

### 1. **app-new.js** (Frontend JavaScript)
**Fitur baru**:
- ✅ `saveDraft()` - simpan draft ke localStorage
- ✅ `loadDraft()` - load draft dari localStorage
- ✅ `deleteDraft()` - hapus draft
- ✅ `submitFinalData()` - submit final ke GDrive
- ✅ `updateDraftIndicator()` - tampilkan indikator draft
- ✅ Auto-update draft key saat ganti tanggal
- ✅ Load data tabel dari draft

**Perubahan**:
- Function `saveData()` diganti dengan `submitFinalData()`
- Tambah localStorage management
- Tambah draft indicator

### 2. **Code-new.gs** (Google Apps Script Backend)
**Fitur baru**:
- ✅ `getOrCreateMonthlySpreadsheet(yearMonth)` - buat spreadsheet per bulan
- ✅ `getOrCreateMasterSpreadsheet()` - spreadsheet master untuk users
- ✅ `updateIndexSheet()` - update index laporan
- ✅ Auto-create sheet per hari
- ✅ Auto-detect year-month dari tanggal

**Perubahan**:
- Logic penyimpanan sepenuhnya diubah
- Hapus field `halaman` dan `revisi` (tidak diperlukan)
- Struktur folder lebih terorganisir

### 3. **index-updated.html** (HTML Interface)
**Fitur baru**:
- ✅ Draft indicator (notifikasi draft tersimpan)
- ✅ Tombol "Save Draft"
- ✅ Tombol "Submit Final"
- ✅ Tombol "Hapus Draft"

**Perubahan**:
- Tombol "Simpan Laporan" diganti dengan 2 tombol terpisah
- Tambah visual indicator untuk draft

---

## 🚀 CARA INSTALL & SETUP

### STEP 1: Setup Google Apps Script

1. **Buka Google Drive** Anda
2. **Buat folder** untuk menyimpan laporan
3. **Copy Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/1b1wAF-xyz...
                                          ↑↑↑ Copy ini
   ```

4. **Buka Google Apps Script**:
   - Buka https://script.google.com
   - Klik "+ New Project"
   - Ganti nama project: "Laporan Produksi API v2"

5. **Paste code dari `Code-new.gs`**:
   - Hapus semua code default
   - Paste seluruh isi file `Code-new.gs`
   - **PENTING**: Update baris 7-8:
     ```javascript
     DRIVE_FOLDER_ID: 'PASTE_FOLDER_ID_ANDA_DISINI',
     NOTIFICATION_EMAILS: 'email1@gmail.com,email2@gmail.com',
     ```

6. **Deploy sebagai Web App**:
   - Klik "Deploy" > "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Klik "Deploy"
   - **COPY URL** yang muncul (contoh: https://script.google.com/macros/s/AKfycby...)

7. **Test setup**:
   - Klik icon "▶" di toolbar
   - Pilih function `testSetup`
   - Klik "Run"
   - Lihat Log (Ctrl+Enter)
   - Harus muncul: "✅ Master Spreadsheet: ..." dan "✅ Monthly Spreadsheet: ..."

### STEP 2: Setup Frontend

1. **Update API URL di `app-new.js`**:
   - Buka file `app-new.js`
   - Baris 3:
     ```javascript
     const API_URL = 'PASTE_WEB_APP_URL_ANDA_DISINI';
     ```

2. **Upload ke hosting** atau **test lokal**:
   
   **Opsi A: Test Lokal (Python)**
   ```bash
   python server.py
   # Buka: http://localhost:8000
   ```
   
   **Opsi B: Deploy ke Netlify/Vercel** (gratis)
   - Zip folder dengan file:
     - index-updated.html (rename jadi index.html)
     - app-new.js (rename jadi app.js)
     - style.css
     - manifest.json
   - Upload ke Netlify/Vercel

3. **Login & Test**:
   - Username: `admin`
   - Password: `admin123`

---

## 📖 CARA PAKAI (WORKFLOW BARU)

### Scenario 1: Input Data Bertahap (Pakai Draft)

1. **Pagi hari (07:00)**:
   - Login aplikasi
   - Pilih tanggal: 28 Januari 2026
   - Input data jam 07:00, 08:00, 09:00
   - Klik "💾 Save Draft"
   - ✅ Data tersimpan di browser
   - Bisa tutup aplikasi

2. **Siang hari (12:00)**:
   - Buka aplikasi lagi
   - Tanggal 28 Januari masih terpilih
   - Popup: "Draft ditemukan. Load draft?"
   - Klik OK
   - ✅ Data pagi muncul lagi
   - Tambah data jam 10:00, 11:00, 12:00
   - Klik "💾 Save Draft" lagi

3. **Sore hari (17:00)**:
   - Buka aplikasi
   - Load draft lagi
   - Lengkapi semua data
   - **FINAL**: Klik "📤 Submit Final ke GDrive"
   - Konfirmasi: OK
   - ✅ Data dikirim ke Google Drive
   - ✅ Draft otomatis terhapus
   - ✅ Email notifikasi terkirim

### Scenario 2: Input Langsung (Tanpa Draft)

1. **Semua data sudah siap**:
   - Login
   - Input semua data sekaligus
   - Langsung klik "📤 Submit Final ke GDrive"
   - ✅ Selesai

### Scenario 3: Hapus Draft

1. **Kalau draft salah/tidak diperlukan**:
   - Load halaman dengan tanggal yang punya draft
   - Klik "🗑️ Hapus Draft"
   - Konfirmasi: OK
   - ✅ Draft terhapus

---

## 🔍 CEK HASIL DI GOOGLE DRIVE

### 1. Cek Spreadsheet
```
Google Drive > Folder Anda > 
  📊 Laporan Produksi Air Bersih - 2026-01
```

**Isi spreadsheet**:
- Sheet "Index Laporan": Daftar semua laporan bulan ini
- Sheet "Laporan_2026_01_28": Data detail hari 28 Jan
- Sheet "Laporan_2026_01_29": Data detail hari 29 Jan
- Sheet "Activity Logs": Log aktivitas

### 2. Cek File JSON
```
Google Drive > Folder Anda > 
  📁 Laporan JSON - 2026-01
    📄 RPT-1737999999_2026-01-28.json
    📄 RPT-1737999999_2026-01-28_SUMMARY.txt
```

### 3. Cek Email
- Email notifikasi otomatis terkirim setelah submit
- Berisi ringkasan laporan

---

## 🎨 VISUAL INDIKATOR

### Draft Tersimpan
Jika ada draft, muncul box kuning di atas tombol:
```
┌─────────────────────────────────────┐
│ 💾 Draft tersimpan: 28/01/2026 10:30 │
└─────────────────────────────────────┘
```

### Tombol Layout
```
┌──────────────────┐ ┌──────────────────┐
│ 💾 Save Draft    │ │ 📤 Submit Final  │
│ (Lanjutkan Nanti)│ │ ke GDrive        │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ 🔄 Reset Form    │ │ 🗑️ Hapus Draft   │
└──────────────────┘ └──────────────────┘
```

---

## ⚠️ PENTING - HAL YANG HARUS DIPERHATIKAN

### 1. Draft = Lokal, Submit = Cloud
- **Draft**: Disimpan di browser Anda (offline)
  - Jika clear browser data = draft hilang
  - Hanya bisa diakses di device yang sama
  - Tidak sync antar device
  
- **Submit**: Disimpan di Google Drive (cloud)
  - Permanent
  - Bisa diakses dari mana saja
  - Ada di riwayat

### 2. Satu Draft per Tanggal
- Draft key: `draft_2026-01-28`
- Jika ganti tanggal, draft lama tetap tersimpan
- Setiap tanggal punya draft sendiri

### 3. Submit = Final
- Setelah submit, data tidak bisa diubah
- Draft otomatis terhapus
- Jika ada kesalahan, harus submit ulang (akan masuk sheet yang sama)

### 4. Auto Spreadsheet per Bulan
- 1 Januari 2026 → Buat spreadsheet baru "2026-01"
- 1 Februari 2026 → Buat spreadsheet baru "2026-02"
- Otomatis, tidak perlu manual

### 5. Auto Sheet per Hari
- Tanggal 28 → Sheet "Laporan_2026_01_28"
- Tanggal 29 → Sheet "Laporan_2026_01_29"
- Submit berulang di hari yang sama → masuk sheet yang sama

---

## 🐛 TROUBLESHOOTING

### Problem: "Draft tidak tersimpan"
**Solusi**:
- Cek apakah tanggal sudah diisi
- Cek browser console (F12) untuk error
- Pastikan localStorage tidak disabled

### Problem: "Submit gagal"
**Solusi**:
- Cek koneksi internet
- Cek API URL di app-new.js
- Cek Google Apps Script sudah deploy
- Lihat error message yang muncul

### Problem: "Spreadsheet tidak dibuat otomatis"
**Solusi**:
- Cek DRIVE_FOLDER_ID sudah benar
- Cek permission Google Apps Script
- Run `testSetup()` di Apps Script Editor
- Lihat Log untuk error detail

### Problem: "Draft tidak ke-load"
**Solusi**:
- Pastikan tanggal yang dipilih sama dengan tanggal draft
- Klik tombol "Load Draft" atau refresh halaman
- Cek localStorage di browser DevTools

---

## 📞 SUPPORT

Jika ada pertanyaan atau masalah:

1. **Cek Log di Google Apps Script**:
   - Buka Apps Script Editor
   - View > Logs (Ctrl+Enter)
   - Lihat error message

2. **Cek Browser Console**:
   - F12 di browser
   - Tab "Console"
   - Lihat error JavaScript

3. **Test Functions**:
   - `testSetup()` - test konfigurasi dasar
   - `testMonthlyCreation()` - test pembuatan spreadsheet

---

## 📝 CHANGELOG

### Version 2.0 (Sekarang)
- ✅ Tambah fitur Save Draft
- ✅ Pisah Submit Final dari Draft
- ✅ Auto create sheet per hari
- ✅ Auto create spreadsheet per bulan
- ✅ Hapus field halaman & revisi (tidak perlu)
- ✅ Struktur folder lebih terorganisir
- ✅ Draft indicator visual

### Version 1.0 (Sebelumnya)
- Basic input form
- Direct save ke Google Sheets
- Email notification
- History view

---

## 🎯 FITUR MENDATANG (Saran)

- [ ] Export laporan ke PDF
- [ ] Grafik/chart dari data
- [ ] Multi-user collaboration
- [ ] Notifikasi push
- [ ] Sync draft ke cloud
- [ ] Edit laporan yang sudah submit
- [ ] Approval workflow
- [ ] Data analytics dashboard

---

**🎉 SELAMAT MENGGUNAKAN SISTEM BARU! 🎉**

Sistem ini dirancang agar lebih fleksibel:
- Input data bertahap dengan draft
- Submit hanya ketika sudah yakin
- Otomatis terorganisir per hari & bulan
- Data lebih aman & terstruktur
