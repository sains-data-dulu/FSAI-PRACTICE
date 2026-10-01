// Google Apps Script — rekap Pretest & Post-test BPJS ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML); dikirim ke peserta hanya setelah mereka mengumpulkan.
const KEY = {
  pretest:  "CADBACCDCABDABC".split(""),
  posttest: "BDBACBDBCADABCA".split("")
};

const EXPL = {
  pretest: [
    "Tidak ada label/target → unsupervised learning → clustering.",
    "Satuan berbeda jauh; tanpa standardisasi jarak Euclidean hampir hanya ditentukan biaya_klaim.",
    "Penurunan: 480, 220, lalu hanya 30, 20, 15. Siku di k = 3.",
    "2.600 / (1.200 + 2.600 + 1.200) = 2.600 / 5.000 = 52%.",
    "Ketiga nilai jauh di atas 0 (rata-rata): usia, kunjungan, dan biaya semuanya tinggi.",
    "Jumlah garis vertikal yang terpotong = jumlah cluster.",
    "K-Means butuh rata-rata numerik; untuk kategorik gunakan K-Modes atau Gower + PAM.",
    "Pilih silhouette tertinggi: 0,58 pada k = 3.",
    "Total variansi = jumlah variabel = 4. 2,4 / 4 = 60%.",
    "Hanya Dim1 (2,1) dan Dim2 (1,3) yang > 1.",
    "Loading besar dan searah pada usia, kunjungan, biaya; jarak_faskes hampir 0.",
    "Skor positif besar searah dengan loading positif → nilai di atas rata-rata pada variabel tersebut.",
    "MCA = versi PCA untuk banyak variabel kategorik.",
    "Kategori berdekatan = sering muncul bersama; jauh dari pusat = pembeda/khas.",
    "% inertia MCA memang cenderung kecil karena data diubah menjadi banyak kolom dummy."
  ],
  posttest: [
    "Clustering = mengelompokkan tanpa label (unsupervised). Opsi lain adalah klasifikasi, regresi, dan uji hipotesis.",
    "Rentang jml_peserta (puluhan ribu) jauh lebih besar sehingga mendominasi jarak Euclidean.",
    "Penurunan: 190, 280, 150, lalu hanya 15 dan 10. Siku di k = 4.",
    "Cluster terkecil 150 / 1.500 = 10%.",
    "jml_peserta +1,8 dan jml_dokter +1,5 jauh di atas rata-rata; rujukan sedikit di bawah rata-rata.",
    "Dendrogram memungkinkan memilih jumlah cluster setelah melihat struktur penggabungan.",
    "Data campuran numerik-kategorik → K-Prototypes atau Gower + PAM.",
    "Silhouette negatif → rata-rata jarak ke cluster lain lebih kecil daripada ke cluster sendiri.",
    "Eigenvalue = sdev² = 1,5² = 2,25. Total = 5. 2,25 / 5 = 45%.",
    "Kumulatif Dim1–Dim3 = 81% ≥ 80%.",
    "Dua loading besar berlawanan tanda: jarak_faskes (+) vs kunjungan (−).",
    "Jarak di plot PCA mencerminkan kemiripan profil pada variabel input.",
    "MCA untuk beberapa variabel kategorik sekaligus.",
    "Kategori dekat pusat = mirip profil rata-rata, kontribusinya kecil terhadap dimensi.",
    "eta² terkecil (0,03) = jenis_kelamin; Dim1 terutama dibentuk kelas_rawat dan segmen."
  ]
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const test = d.test === "posttest" ? "posttest" : "pretest";
    const key = KEY[test];
    const ans = (d.answers || []).slice(0, key.length);
    let correct = 0;
    key.forEach((k, i) => { if (ans[i] === k) correct++; });
    const score = Math.round(correct / key.length * 1000) / 10;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = test === "pretest" ? "Pretest" : "Posttest";
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      const head = ["Waktu", "Nama", "Email", "Benar", "Skor"];
      for (let i = 1; i <= key.length; i++) head.push("No " + i);
      sh.appendRow(head);
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date(), d.nama, d.email, correct, score].concat(ans));
    return out({ ok: true, correct: correct, total: key.length, score: score,
                 key: key, expl: EXPL[test] });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
