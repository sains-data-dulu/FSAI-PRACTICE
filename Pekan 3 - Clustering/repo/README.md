# Pekan 3 · Clustering, PCA & MCA — BPJS Data Analytics Training

Satu website (GitHub Pages) yang menyatukan seluruh modul pelatihan.

```
/
├── index.html                  ← Landing page (menu utama)
├── assets/site-nav.js          ← Tombol "Menu" melayang di semua sub-halaman
├── pretest-posttest/           ← Menu 1 · Pretest – Posttest
│   ├── index.html  pretest.html  posttest.html
│   └── assets/ (app.js, style.css, config.js ← URL Apps Script)
├── materi/                     ← Menu 2 · Materi
│   ├── index.html              ← ringkasan konsep + daftar slide
│   └── files/                  ← taruh slide PDF/PPTX di sini
├── hands-on/                   ← Menu 3 · Hands On
│   ├── index.html
│   └── hands_on_clustering_pca_mca.Rmd
├── latihan-soal/index.html     ← Menu 4 · Latihan Soal
└── simulasi-soal/              ← Menu 5 · Simulasi Soal
    ├── index.html
    └── data/ (CSV + kode R)
```

Setelah online, alamatnya menjadi:

| Menu | URL |
|---|---|
| Beranda | `https://<username>.github.io/<nama-repo>/` |
| Pretest – Posttest | `…/pretest-posttest/` |
| Materi | `…/materi/` |
| Hands On | `…/hands-on/` |
| Latihan Soal | `…/latihan-soal/` |
| Simulasi Soal | `…/simulasi-soal/` |

## Cara upload ke GitHub

1. Buat repository baru (**Public**), misalnya `pekan3-clustering`.
2. **Add file → Upload files**, lalu seret **seluruh isi folder `repo`** (bukan foldernya) ke halaman upload. Pastikan file `.nojekyll` ikut terunggah (di Windows aktifkan *Show hidden items*).
3. **Commit changes**.
4. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pilih `main` dan `/ (root)`, lalu **Save**.
5. Tunggu 1–2 menit, lalu buka link yang muncul di Settings → Pages.

Alternatif lewat git:

```bash
cd repo
git init && git add . && git commit -m "Website Pekan 3"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

## Yang perlu diatur

| Apa | Di mana |
|---|---|
| URL Apps Script Pretest–Posttest | `pretest-posttest/assets/config.js` → `window.API_URL` (sudah terisi) |
| URL Apps Script Latihan Soal | `latihan-soal/index.html` → cari `var SHEET_URL` (sudah terisi) |
| Slide materi | upload ke `materi/files/`, lalu tambahkan di array `SLIDES` pada `materi/index.html` |

Kedua URL Apps Script di atas sudah terisi dari versi sebelumnya, jadi rekap nilai tetap masuk ke spreadsheet yang sama.

## Keamanan

File Google Apps Script (`*.gs`) **tidak** ada di repo ini dan jangan diunggah, karena file Pretest–Posttest berisi soal, kunci jawaban, dan kode akses. Simpan di folder `apps-script (JANGAN DIUPLOAD)`.
