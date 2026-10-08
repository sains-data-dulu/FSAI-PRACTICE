// Google Apps Script — rekap Pretest & Post-test Pekan 1 Day 1 · Data Cleaning ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML).
// Pretest: peserta hanya menerima skor. Post-test: peserta menerima skor + kunci + pembahasan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok dengan VER di HTML.
const VER = "p1d1-1";

// Awalan nama sheet, supaya beberapa hari bisa disalin ke satu spreadsheet tanpa bentrok nama.
const PREFIX = "P1D1 ";

// Soal Pekan 1 Day 1 · Data Cleaning — pretest dan post-test memakai soal & kunci yang sama.
const KEY = "BCBCBDBCCBCACCC".split("");

// Pembahasan per nomor (HTML).
const EXPL = [
    "<p>Langkah awal data cleaning adalah memahami unit observasi. Jika satu baris seharusnya mewakili satu peserta, kita harus memastikan struktur data konsisten dengan definisi tersebut. Tanpa memastikan unit observasi, pemeriksaan duplikasi, inkonsistensi, dan agregasi dapat menghasilkan keputusan yang keliru. Pemeriksaan mean, median, outlier, atau bentuk distribusi dilakukan setelah struktur dasar data dipahami.</p>",
    "<p>Fungsi dim(data) mengembalikan dua angka: jumlah baris dan jumlah kolom. Jumlah baris merepresentasikan jumlah observasi, sedangkan jumlah kolom merepresentasikan jumlah variabel. summary(data) memberikan ringkasan statistik, head(data) menampilkan beberapa baris awal, dan table(data) bukan fungsi utama untuk melihat dimensi dataset.</p>",
    "<p>Output chr menunjukkan tipe data character. Karena biaya_klaim akan dipakai dalam perhitungan seperti mean, median, atau model numerik, variabel perlu diperiksa dan dikonversi ke numeric setelah memastikan tidak ada karakter pemisah, simbol mata uang, atau kode lain yang menyebabkan konversi gagal.</p>",
    "<p>Nilai numeric tidak otomatis berarti valid. Berdasarkan makna variabel, usia negatif tidak mungkin, jumlah klaim negatif tidak logis, dan biaya klaim negatif juga tidak sesuai untuk nilai klaim pada konteks ini. Nilai yang bermasalah sebaiknya ditandai dan diinvestigasi terlebih dahulu, bukan langsung menghapus seluruh baris.</p>",
    "<p>Kondisi \"di luar range 0-120\" berarti usia lebih kecil dari 0 ATAU lebih besar dari 120. Karena cukup salah satu kondisi terpenuhi, operator yang digunakan adalah | (OR). Opsi A justru memilih data di dalam rentang, opsi C hanya mencari missing value, dan opsi D menghitung frekuensi usia.</p>",
    "<p>Usia 90 tahun mungkin merupakan nilai ekstrem dibanding mayoritas, tetapi masih masuk akal secara domain. Outlier bukan sinonim dari error. Data perlu diverifikasi terhadap sumber, aturan bisnis, atau konteks peserta sebelum diputuskan untuk dipertahankan, ditransformasi, atau dikeluarkan.</p>",
    "<p>duplicated(data) membandingkan keseluruhan nilai pada setiap baris terhadap baris sebelumnya dan menandai baris yang merupakan duplikasi identik. sum(...) kemudian menghitung banyaknya TRUE. Ini berbeda dari mengecek duplikasi hanya pada id_peserta; untuk itu diperlukan pemeriksaan khusus pada kolom ID.</p>",
    "<p>ID yang berulang belum tentu salah. Jika satu peserta bisa memiliki beberapa transaksi atau klaim, repeated record mungkin valid. Sebaliknya, jika satu baris seharusnya mewakili satu peserta, ID berulang perlu ditelusuri sebagai potensi duplikasi atau kesalahan struktur. Karena itu, keputusan harus kembali pada definisi unit observasi.</p>",
    "<p>NA secara umum menyatakan missing, tetapi 999 dan -99 bisa merupakan kode khusus dari sistem, misalnya \"tidak diketahui\", \"tidak berlaku\", atau kode error. Sementara itu, 0 dapat merupakan nilai sah yang berarti peserta tidak memiliki klaim. Arti setiap kode harus dikonfirmasi dari dokumentasi atau business rule sebelum dilakukan recoding atau imputasi.</p>",
    "<p>Pada distribusi yang sangat right-skewed, nilai besar dapat menarik mean ke arah ekor kanan sehingga mean kurang mewakili nilai tipikal. Median lebih tahan terhadap extreme values sehingga sering lebih masuk akal sebagai imputasi sederhana. Namun, pilihan metode imputasi tetap sebaiknya mempertimbangkan pola missing dan konteks bisnis.</p>",
    "<p>Secara individual, jumlah_klaim = 0 dan biaya_klaim = 2.000.000 adalah angka yang mungkin. Namun kombinasi keduanya tidak konsisten apabila biaya klaim hanya boleh muncul ketika ada klaim. Ini adalah contoh pemeriksaan lintas variabel (cross-variable consistency), bukan sekadar pengecekan nilai tunggal atau outlier.</p>",
    "<p>Kita mencari baris yang memenuhi dua kondisi sekaligus: jumlah_klaim sama dengan 0 DAN biaya_klaim lebih besar dari 0. Karena keduanya wajib terpenuhi pada baris yang sama, operator yang digunakan adalah & (AND). Menggunakan | akan mengambil baris yang hanya memenuhi salah satu kondisi sehingga terlalu luas.</p>",
    "<p>Data yang tidak konsisten sebaiknya tidak langsung diperbaiki secara asumtif. Kita belum tahu apakah jumlah_klaim salah, biaya_klaim salah, atau ada definisi bisnis lain. Flagging mempertahankan jejak masalah dan memungkinkan verifikasi terhadap sumber data sebelum recoding, koreksi, atau penghapusan dilakukan.</p>",
    "<p>Boxplot membantu mendeteksi kandidat outlier, tetapi tidak membuktikan bahwa nilai tersebut salah. Klaim Rp100 juta bisa merupakan klaim besar yang benar. Langkah yang tepat adalah menelusuri observasinya, memeriksa sumber data, konteks klaim, dan business rule. Treatment baru dipilih setelah validitas nilai diketahui.</p>",
    "<p>Data cleaning perlu diakhiri dengan quality check ulang. Pastikan tipe data sudah benar, missing value tersisa sesuai kebijakan, duplikasi telah tertangani, nilai invalid tidak muncul lagi, serta flag dan aturan konsistensi bekerja sebagaimana mestinya. EDA sebaiknya dilakukan setelah dataset hasil cleaning telah divalidasi.</p>"
  ];

/** Dibuka saat halaman tes dimuat (pemanasan server); bisa juga dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test Pekan 1 Day 1 · Data Cleaning aktif." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const test = d.test === "posttest" ? "posttest" : "pretest";
    const ans = (d.answers || []).slice(0, KEY.length).map(a => String(a || "").toUpperCase());
    let correct = 0;
    KEY.forEach((k, i) => { if (ans[i] === k) correct++; });
    const score = Math.round(correct / KEY.length * 1000) / 10;
    const nama = String(d.nama || "").trim();
    const email = String(d.email || "").trim().toLowerCase();
    const now = new Date();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = PREFIX + (test === "pretest" ? "Pretest" : "Posttest");
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      const head = ["Waktu", "Nama", "Email", "Benar", "Skor"];
      for (let i = 1; i <= KEY.length; i++) head.push("No " + i);
      sh.appendRow(head);
      sh.setFrozenRows(1);
    }
    sh.appendRow([now, nama, email, correct, score].concat(ans));
    upsertRekap_(ss, test, nama, email, score, now);

    const res = { ok: true, ver: VER, correct: correct, total: KEY.length, score: score };
    if (test === "posttest") { res.key = KEY; res.expl = EXPL; }
    return out(res);
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sheet Rekap: satu baris per email, berisi skor pretest & post-test terakhir dan kenaikannya.
 * Jika peserta mengirim lebih dari sekali, nilai yang tercatat di Rekap adalah kiriman terakhir
 * (semua kiriman tetap tersimpan lengkap di sheet Pretest / Posttest).
 */
function upsertRekap_(ss, test, nama, email, score, when) {
  const name = PREFIX + "Rekap";
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(["Email", "Nama", "Skor Pretest", "Waktu Pretest", "Skor Posttest", "Waktu Posttest", "Kenaikan (Post − Pre)"]);
    sh.setFrozenRows(1);
  }
  const last = sh.getLastRow();
  let row = -1;
  if (last > 1) {
    const emails = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === email) { row = i + 2; break; }
    }
  }
  if (row < 0) row = last + 1;
  sh.getRange(row, 1, 1, 2).setValues([[email, nama]]);
  sh.getRange(row, test === "pretest" ? 3 : 5, 1, 2).setValues([[score, when]]);
  sh.getRange(row, 7).setFormula(`=IF(AND(ISNUMBER(C${row}),ISNUMBER(E${row})),E${row}-C${row},"")`);
}

/**
 * Opsional: jalankan manual dari editor Apps Script untuk menyusun ulang sheet Rekap
 * dari isi sheet Pretest dan Posttest (misalnya setelah ada baris yang dihapus).
 */
function susunUlangRekap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName(PREFIX + "Rekap");
  if (old) ss.deleteSheet(old);
  ["pretest", "posttest"].forEach(test => {
    const sh = ss.getSheetByName(PREFIX + (test === "pretest" ? "Pretest" : "Posttest"));
    if (!sh || sh.getLastRow() < 2) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().forEach(r => {
      upsertRekap_(ss, test, r[1], String(r[2]).trim().toLowerCase(), r[4], r[0]);
    });
  });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
