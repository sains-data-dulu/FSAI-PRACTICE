// Google Apps Script — rekap Pretest & Post-test Pekan 2 Day 2 · Interpretasi Visualisasi & Pengantar Clustering ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML).
// Pretest: peserta hanya menerima skor. Post-test: peserta menerima skor + kunci + pembahasan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok dengan VER di HTML.
const VER = "p2d2-1";

// Awalan nama sheet, supaya beberapa hari bisa disalin ke satu spreadsheet tanpa bentrok nama.
const PREFIX = "P2D2 ";

// Soal Pekan 2 Day 2 · Interpretasi Visualisasi & Pengantar Clustering — pretest dan post-test memakai soal & kunci yang sama.
const KEY = "BADCABBBBBBACBD".split("");

// Pembahasan per nomor (HTML).
const EXPL = [
    "<p>Boxplot membandingkan distribusi claim_amount menurut claim_type dan fraud_flag. Data yang diberikan menunjukkan klaim fraud cenderung bernilai lebih tinggi daripada non-fraud, tetapi pola tersebut tidak membuktikan kausalitas dan tidak berarti seluruh klaim bernilai tinggi pasti fraud. Karena itu, claim amount layak dipertimbangkan sebagai salah satu fitur, bukan satu-satunya penentu fraud.</p>",
    "<p>100% stacked bar chart memperlihatkan proporsi Health Insurance di dalam kelompok Life Insurance. Dari data, pemilik Life Insurance memiliki proporsi Health Insurance yang lebih tinggi. Temuan ini dapat menjadi dasar untuk mengidentifikasi peluang cross-selling, tetapi tidak membuktikan kebutuhan pasti, hubungan sebab-akibat, atau bahwa kelompok lain harus diabaikan.</p>",
    "<p>Scatter plot dan garis tren menunjukkan asosiasi positif: ketika risk score meningkat, claim_count cenderung meningkat. Namun, hubungan ini bersifat kecenderungan, bukan kepastian individual atau bukti kausal. Karena itu risk score tepat diperlakukan sebagai salah satu variabel dalam segmentasi atau model risiko.</p>",
    "<p>Titik-titik menunjukkan premium meningkat seiring usia dan polanya tampak tidak harus linear sempurna. Interpretasi yang hati-hati adalah usia dapat menjadi salah satu faktor pricing. Visualisasi tidak membuktikan bahwa usia adalah satu-satunya faktor, tidak menjamin kenaikan yang konstan, dan tidak mendukung tarif identik bagi semua nasabah dengan usia sama.</p>",
    "<p>Grafik merangkum rata-rata claim amount per risk segment dan menunjukkan peningkatan dari Low ke High. Ini berguna untuk memahami profil portofolio dan mendukung pengelolaan risiko. Namun, rata-rata kelompok tidak menjamin setiap individu mengikuti pola yang sama dan tidak membuktikan kausalitas.</p>",
    "<p>Clustering merupakan metode unsupervised learning. Ketika tidak ada label target dan tujuan analisis adalah menemukan kelompok observasi yang memiliki karakteristik serupa, clustering digunakan untuk mengidentifikasi struktur kelompok dalam data, bukan untuk memprediksi target yang sudah diketahui.</p>",
    "<p>K-Means bergantung pada jarak. Jika usia berada pada skala puluhan sementara pendapatan berada pada skala ratusan juta, perbedaan pendapatan akan mendominasi perhitungan jarak. Scaling diperlukan agar kontribusi variabel tidak semata-mata ditentukan oleh besar satuannya.</p>",
    "<p>Gower distance dirancang untuk menghitung ketidakmiripan pada data campuran numerik dan kategorik. K-Medoids menggunakan medoid sebagai pusat cluster sehingga umumnya lebih tahan terhadap outlier dibanding K-Means yang menggunakan mean. Kombinasi keduanya paling sesuai dengan karakteristik data pada soal.</p>",
    "<p>Secara prinsip, Elbow Method memilih K pada titik ketika tambahan cluster mulai memberikan penurunan WCSS yang jauh lebih kecil. Dari pola K=2 sampai K=6, penurunan 620→410 jauh lebih besar dibanding 410→350→320→300, sehingga elbow yang dimaksud adalah sekitar K=3. Catatan penting: nilai WCSS K=1 pada soal tertulis '1', yang tidak konsisten dengan sifat WCSS yang seharusnya tidak meningkat saat K bertambah. Karena itu jawaban ini mengikuti pola yang jelas dari K=2 sampai K=6 serta opsi yang disediakan, tanpa mengubah nilai yang tertulis pada soal.</p>",
    "<p>Tabel cluster hanya menggambarkan profil rata-rata tiap kelompok. Cluster 3 memang memiliki rata-rata usia, pendapatan, dan klaim tertinggi, tetapi informasi tersebut tidak membuktikan kerugian terbesar, tidak menjamin semua anggotanya berisiko tinggi, dan tidak menunjukkan bahwa usia menyebabkan peningkatan klaim.</p>",
    "<p>Euclidean menggunakan kuadrat komponen jarak dalam perhitungan keseluruhan dan dapat lebih sensitif terhadap perbedaan ekstrem. Manhattan menggunakan jumlah selisih absolut dan sering dipertimbangkan ketika ingin mengurangi pengaruh nilai ekstrem. Keduanya dapat digunakan pada data numerik.</p>",
    "<p>Centroid K-Means adalah mean dari observasi dalam cluster. Mean sensitif terhadap nilai ekstrem, sehingga satu outlier dapat menarik posisi centroid ke arahnya dan memengaruhi pembentukan cluster. K-Means tidak otomatis menghapus atau selalu memisahkan outlier.</p>",
    "<p>Hierarchical clustering membangun struktur pengelompokan bertingkat yang dapat divisualisasikan dalam dendrogram. Analis dapat memotong dendrogram pada level tertentu untuk menentukan jumlah cluster. K-Means biasanya memerlukan K di awal, sedangkan DBSCAN dan GMM tidak menghasilkan dendrogram hierarkis seperti yang diminta.</p>",
    "<p>Dalam DBSCAN, core point memiliki cukup banyak tetangga dalam radius ε. Border point tidak memenuhi kepadatan minimum tetapi berada dalam lingkungan core point. Titik yang tidak terjangkau dari cluster mana pun dikategorikan sebagai noise. Karena itu A=core, B=border, C=noise.</p>",
    "<p>Gaussian Mixture Model (GMM) menghasilkan soft assignment, yaitu probabilitas setiap observasi berasal dari masing-masing komponen/cluster. Ini sesuai ketika cluster saling overlap dan keanggotaan tidak selalu tegas. K-Means dan hierarchical clustering umumnya memberikan hard assignment, sedangkan DBSCAN mengklasifikasikan core, border, dan noise tanpa probabilitas keanggotaan seperti GMM.</p>"
  ];

/** Dibuka saat halaman tes dimuat (pemanasan server); bisa juga dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test Pekan 2 Day 2 · Interpretasi Visualisasi & Pengantar Clustering aktif." });
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
