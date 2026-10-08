// Google Apps Script — rekap Pretest & Post-test Pekan 2 Day 1 · Visualisasi Data ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML).
// Pretest: peserta hanya menerima skor. Post-test: peserta menerima skor + kunci + pembahasan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok dengan VER di HTML.
const VER = "p2d1-1";

// Awalan nama sheet, supaya beberapa hari bisa disalin ke satu spreadsheet tanpa bentrok nama.
const PREFIX = "P2D1 ";

// Soal Pekan 2 Day 1 · Visualisasi Data — pretest dan post-test memakai soal & kunci yang sama.
const KEY = "BBAABBCBDABBBAC".split("");

// Pembahasan per nomor (HTML).
const EXPL = [
    "<p>Histogram menunjukkan bentuk distribusi severity claim, termasuk skewness dan konsentrasi nilai, sedangkan boxplot membantu mengidentifikasi median, IQR, serta observasi yang berpotensi menjadi outlier. Kombinasi ini paling sesuai untuk eksplorasi awal sebelum model pricing dibangun.</p>",
    "<p>Pada bar chart, panjang batang merepresentasikan besarnya nilai sehingga baseline yang dipotong dapat memperbesar kesan visual perbedaan. Memulai sumbu Y dari Rp90 juta dapat membuat selisih kecil antarprovinsi tampak sangat besar, walaupun data aslinya tidak berubah.</p>",
    "<p>Boxplot memungkinkan perbandingan distribusi numerik antarkelompok secara langsung, termasuk median, rentang antar-kuartil, penyebaran, dan outlier. Karena tujuan analisis adalah membandingkan biaya klaim antara dua tipe nasabah, boxplot per tipe nasabah paling informatif.</p>",
    "<p>Scatter plot digunakan untuk mengeksplorasi hubungan antara dua variabel numerik. Setiap titik dapat mewakili satu observasi dengan usia pada sumbu X dan severity klaim pada sumbu Y, sehingga arah, pola, kekuatan hubungan, serta titik ekstrem dapat diamati.</p>",
    "<p>100% stacked bar chart menormalkan setiap batang wilayah menjadi 100%, sehingga komposisi fraud dan non-fraud dapat dibandingkan berdasarkan proporsi, bukan sekadar jumlah absolut. Ini tepat ketika fokus pertanyaan adalah persentase dalam masing-masing wilayah.</p>",
    "<p>100% stacked bar chart menormalkan setiap batang wilayah menjadi 100%, sehingga komposisi fraud dan non-fraud dapat dibandingkan berdasarkan proporsi di dalam masing-masing wilayah, bukan jumlah absolut.</p>",
    "<p>Nilai yang sangat tinggi dibanding mayoritas data dapat disebut kandidat outlier, tetapi outlier tidak otomatis berarti fraud atau kesalahan input. Nilai tersebut perlu ditelusuri menggunakan konteks bisnis, catatan transaksi, diagnosis, atau sumber data lain sebelum diputuskan treatment-nya.</p>",
    "<p>Visualisasi yang ditujukan untuk manajemen berfungsi menyampaikan temuan dan pesan utama kepada audiens. Karena fokusnya bukan lagi menemukan pola baru, melainkan mengomunikasikan faktor utama peningkatan loss ratio, visualisasi tersebut termasuk communication visualization.</p>",
    "<p>Untuk memperoleh total premium per wilayah, data perlu dikelompokkan berdasarkan region lalu nilai Premium dijumlahkan pada masing-masing kelompok, misalnya group_by(Region) %>% summarise(total_premium = sum(Premium, na.rm = TRUE)). Hasil agregasi inilah yang kemudian dapat divisualisasikan.</p>",
    "<p>Line chart cocok untuk memperlihatkan perubahan nilai sepanjang urutan waktu. Dengan bulan Januari sampai Desember pada sumbu X dan jumlah kunjungan pada sumbu Y, tren naik, turun, atau pola musiman dapat dilihat secara jelas.</p>",
    "<p>Jumlah klaim absolut dipengaruhi oleh banyaknya exposure. Produk yang memiliki polis jauh lebih banyak secara alami dapat menghasilkan lebih banyak klaim. Untuk membandingkan risiko secara adil, jumlah klaim perlu dinormalisasi, misalnya menggunakan claim frequency = jumlah klaim / exposure.</p>",
    "<p>Kode tersebut menghasilkan scatter plot karena <code>geom_point()</code> dipakai dengan dua variabel numerik pada sumbu X dan Y. Tujuannya mengeksplorasi hubungan atau pola antara usia (age) dan biaya klaim (claim_cost). Distribusi satu variabel kategori dan perbandingan jumlah observasi biasanya memakai bar chart, sedangkan komposisi kategori memakai stacked bar atau pie chart.</p>",
    "<p>geom_bar() secara default menggunakan stat = 'count', sehingga menghitung jumlah baris pada setiap kategori product_type. Karena data masih berupa transaksi individu dan yang dibutuhkan adalah jumlah observasi/klaim per produk, kode tersebut paling tepat. geom_col() biasanya digunakan ketika tinggi batang sudah tersedia sebagai variabel numerik hasil agregasi.</p>",
    "<p>geom_bar() dengan hanya product_type pada sumbu X menghitung frekuensi observasi untuk setiap kategori produk. Karena itu grafik menjawab berapa banyak klaim/transaksi pada masing-masing jenis produk, bukan hubungan dua variabel numerik, tren waktu, atau penyebaran severity.</p>",
    "<p>group_by(region) membagi data menjadi kelompok berdasarkan wilayah, sedangkan summarise(avg_claim = mean(claim_amount)) menghitung satu nilai rata-rata claim_amount untuk setiap wilayah. Kode tersebut melakukan agregasi, bukan menghapus outlier atau mengubah tipe variabel.</p>"
  ];

/** Dibuka saat halaman tes dimuat (pemanasan server); bisa juga dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test Pekan 2 Day 1 · Visualisasi Data aktif." });
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
