# Pretest & Post-test · Pekan 1 Day 2 · Exploratory Data Analysis

Folder ini berisi:

- `Pretest_Posttest_BPJS.html` — halaman tes (soal pretest dan post-test sama, 15 soal A–D).
- `Code.gs` — Google Apps Script untuk menilai jawaban dan merekap ke Google Sheet.

## Kode akses

| Tes | Kode akses |
|---|---|
| Pretest | `bpjstrainingpekan1day2pretest` |
| Post-test | `bpjstrainingpekan1day2posttest` |

Kode akses tidak membedakan huruf besar/kecil.

## Memasang rekap di Google Sheet (sekali saja)

1. Buat Google Sheet baru, misalnya **Rekap Pretest-Posttest P1D2**.
2. Buka **Extensions → Apps Script**, hapus isi `Code.gs` bawaan, tempel seluruh isi `Code.gs` dari folder ini, lalu **Save**.
3. Klik **Deploy → New deployment → Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy**, izinkan akses (Authorize), lalu salin **Web app URL** (berakhiran `/exec`).
5. Buka `Pretest_Posttest_BPJS.html` dengan editor teks, cari baris
   `const SCRIPT_URL = "PASTE_URL_WEB_APP_DI_SINI";` lalu ganti isinya dengan URL tadi. Simpan.
6. Cek: buka URL `/exec` di browser. Harus muncul `{"ok":true,"ver":"p1d2-1",...}`.

## Isi spreadsheet

Sheet dibuat otomatis saat jawaban pertama masuk:

- **P1D2 Pretest** dan **P1D2 Posttest** — semua kiriman: waktu, nama, email, jumlah benar, skor (0–100), dan jawaban tiap nomor.
- **P1D2 Rekap** — satu baris per email: skor pretest, skor post-test, dan kenaikannya. Jika peserta mengirim lebih dari sekali, yang tercatat di Rekap adalah kiriman terakhir.

Fungsi `susunUlangRekap` (jalankan manual dari editor Apps Script) menyusun ulang sheet Rekap dari sheet Pretest dan Posttest.

## Catatan

- Setelah **pretest**, peserta hanya melihat skor. Kunci dan pembahasan baru tampil setelah **post-test**, karena soalnya sama.
- Jika `Code.gs` diubah, perbarui deployment lewat **Deploy → Manage deployments → Edit → Version: New version** agar URL tetap sama.
- `VER` di `Code.gs` dan di HTML harus sama (`p1d2-1`). Jika berbeda, halaman tes tidak menampilkan skor.
