// Google Apps Script — rekap Pretest & Post-test Pekan 1 Day 2 · Exploratory Data Analysis ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML).
// Pretest: peserta hanya menerima skor. Post-test: peserta menerima skor + kunci + pembahasan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok dengan VER di HTML.
const VER = "p1d2-1";

// Awalan nama sheet, supaya beberapa hari bisa disalin ke satu spreadsheet tanpa bentrok nama.
const PREFIX = "P1D2 ";

// Soal Pekan 1 Day 2 · Exploratory Data Analysis — pretest dan post-test memakai soal & kunci yang sama.
const KEY = "CBBACBACBCBCCCB".split("");

// Pembahasan per nomor (HTML).
const EXPL = [
    "<p>EDA bertujuan memahami data sebelum membangun model: bentuk distribusi, pola, hubungan antarvariabel, segmentasi, serta potensi anomali. EDA tidak mensyaratkan semua data berdistribusi normal, tidak bertujuan sekadar mengubah tipe data, dan tidak otomatis menghapus nilai ekstrem.</p>",
    "<p>Mean (Rp450 ribu) jauh di atas median (Rp180 ribu) dan maksimum mencapai Rp8 juta. Pola ini konsisten dengan distribusi miring ke kanan (right-skewed), karena beberapa klaim besar menarik mean ke atas. Hal tersebut belum membuktikan adanya kesalahan data; nilai besar perlu diperiksa konteksnya terlebih dahulu.</p>",
    "<p>Median lebih robust terhadap nilai ekstrem dan distribusi miring dibanding mean. Maximum dan range bukan ukuran pemusatan, melainkan menggambarkan nilai ekstrem atau rentang data.</p>",
    "<p>Mean 2,8 jauh lebih tinggi daripada median 1, sementara maksimum 35 sangat jauh dari Q3 = 3. Ini merupakan sinyal kuat adanya ekor kanan yang panjang dan kemungkinan observasi bernilai besar. Posisi median di antara Q1 dan Q3 tidak membuktikan distribusi simetris.</p>",
    "<p>Frequency adalah jumlah kasus pada kategori tertentu. Percentage adalah frequency dibagi total observasi lalu dikalikan 100%. Dalam contoh ini total peserta 1.200, sehingga proporsi P adalah 700/1.200, bukan 700/500.</p>",
    "<p>Karena pertanyaan meminta proporsi rawat inap di dalam masing-masing jenis kelamin, denominator harus total pada setiap baris jenis kelamin. Untuk L: 80/(420+80) = 16%; untuk P: 160/(540+160) ≈ 22,9%. Karena itu yang tepat adalah row percentage.</p>",
    "<p>Histogram membantu melihat bentuk distribusi, kemencengan, dan konsentrasi data. Boxplot membantu melihat median, IQR, serta observasi di luar batas whisker. Crosstab dan bar chart lebih sesuai untuk data kategori, sedangkan scatter plot terutama untuk hubungan dua variabel numerik.</p>",
    "<p>Scatter plot memperlihatkan pola hubungan dua variabel numerik secara visual, sedangkan correlation merangkum arah dan kekuatan hubungan linear. Metode lain pada opsi lebih tepat untuk distribusi satu variabel atau perbandingan kategori.</p>",
    "<p>Korelasi 0,72 menunjukkan hubungan linear positif yang cukup kuat: ketika usia meningkat, biaya klaim cenderung ikut meningkat dalam data. Namun correlation tidak membuktikan kausalitas, bukan proporsi peserta, dan bukan persentase kenaikan biaya per tahun.</p>",
    "<p>EDA mendeskripsikan pola pada data, bukan menetapkan hubungan sebab-akibat. Perbedaan median menunjukkan adanya perbedaan deskriptif antarsegmen yang layak ditelaah lebih lanjut, misalnya melalui distribusi, komposisi peserta, dan faktor lain yang relevan.</p>",
    "<p>Boxplot memungkinkan perbandingan median, IQR, penyebaran, dan kemungkinan nilai ekstrem antarsegmen. Group summary melengkapi visual tersebut dengan ukuran numerik seperti n, mean, median, atau kuartil per kelompok.</p>",
    "<p>group_by(provinsi) membagi data menurut provinsi, lalu summarise() menghitung jumlah observasi, mean, dan median biaya klaim pada tiap provinsi. Hasilnya berguna untuk membandingkan karakteristik biaya klaim antarwilayah.</p>",
    "<p>Observasi di luar batas IQR adalah kandidat outlier, bukan otomatis data salah. Langkah yang baik adalah menelusuri baris terkait, memeriksa validitas dan konteks bisnis, lalu memutuskan treatment berdasarkan tujuan analisis dan bukti yang tersedia.</p>",
    "<p>Pernyataan terbaik tetap berada pada level temuan deskriptif yang didukung data. EDA menunjukkan perbedaan median dan penyebaran, tetapi tidak cukup untuk menyimpulkan sebab-akibat, tingkat risiko secara pasti, atau rekomendasi kebijakan tanpa analisis tambahan.</p>",
    "<p>Alur EDA yang sistematis dimulai dari memahami struktur dan cakupan data, lalu statistik deskriptif serta distribusi kategori, dilanjutkan analisis univariat dan bivariat, perbandingan kelompok, investigasi observasi ekstrem, dan diakhiri dengan komunikasi insight. Modeling bukan langkah awal dalam EDA.</p>"
  ];

/** Dibuka saat halaman tes dimuat (pemanasan server); bisa juga dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test Pekan 1 Day 2 · Exploratory Data Analysis aktif." });
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
