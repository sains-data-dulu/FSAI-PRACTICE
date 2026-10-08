// Google Apps Script — rekap Pretest & Post-test BPJS ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML); dikirim ke peserta hanya setelah mereka mengumpulkan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok.
const VER = "glm-1";

// Soal: Pretest & Posttest Generalized Linear Models (GLM) — data dataCar.
const KEY = {
  pretest:  "BCADBCADBCDABCD".split(""),
  posttest: "CADBCADBADBCADC".split("")
};

// Pembahasan per nomor (HTML, sama dengan file kunci).
const EXPL = {
  pretest: [
    "<p><code>numclaims</code> adalah data <strong>count</strong> (bilangan bulat ≥ 0), sehingga model awalnya Poisson dengan link log. Logistik untuk response 0/1, Gamma untuk response kontinu positif, Linear untuk response kontinu biasa.</p>",
    "<p>Regresi logistik = <code>glm()</code> dengan <code>family = binomial</code> (link bawaannya logit). Pilihan A memasang model Linear; B memasang Poisson; D tanpa <code>family</code> memakai bawaan <code>gaussian</code>, yang sama dengan Linear.</p>",
    "<p><code>dim()</code> mengembalikan <strong>jumlah baris lalu jumlah kolom</strong>. Jadi ada 67.856 polis dan 11 variabel. Nilai hilang dicek dengan <code>colSums(is.na(dataCar))</code>, bukan <code>dim()</code>.</p>",
    "<p>Pada regresi Linear (link identity), koefisien dibaca langsung pada <strong>satuan response</strong>: β = -0,620 berarti rata-rata <code>veh_value</code> turun 0,620 satuan (× 10.000 AUD ≈ 6.200 AUD) per kenaikan satu kelompok umur kendaraan, dengan predictor lain tetap. Tafsir “persen” atau “odds” (A, B) hanya berlaku untuk model dengan link log atau logit.</p>",
    "<p>R² adalah proporsi variasi response yang dijelaskan model: 31,56%. R² bukan persentase prediksi yang benar dan bukan korelasi antara satu predictor dengan response.</p>",
    "<p>Lihat kolom <code>Pr(&gt;|z|)</code>: <code>veh_age</code> p = 0,409 dan <code>genderM</code> p = 0,590, keduanya &gt; 0,05 dan tidak diberi tanda bintang. <code>veh_value</code> (<code>**</code>) dan <code>agecat</code> (<code>***</code>) signifikan.</p>",
    "<p>Pada regresi logistik, <code>exp(β)</code> adalah <strong>odds ratio</strong>: pengali pada <strong>odds</strong>, bukan pada peluang. OR = 0,921 berarti odds klaim turun (1 − 0,921) × 100% ≈ 7,9% per kenaikan satu kelompok usia. Efeknya bersifat perkalian, bukan pengurangan satuan (D).</p>",
    "<p>Null deviance = deviance model <strong>hanya intercept</strong>; residual deviance = deviance model yang dipasang. Penurunan sebesar 82,3 pada 4 derajat bebas (4 koefisien yang ditambahkan, bukan observasi yang dibuang) menunjukkan predictor memperbaiki model. Uji formalnya memakai <code>pchisq(selisih_deviance, 4, lower.tail = FALSE)</code>, hasilnya p-value &lt;2e-16.</p>",
    "<p><code>type = \"response\"</code> pada model logistik mengembalikan <strong>probabilitas</strong>: 0,0720 ≈ 7,2%. Tanpa <code>type</code> (atau <code>type = \"link\"</code>) hasilnya log-odds. Angka <code>1</code> di atas nilai hanyalah nomor baris <code>newdata</code>.</p>",
    "<p>Offset memasukkan log(exposure) ke model dengan koefisien tetap 1, sehingga E[klaim] = exposure × exp(β₀ + β₁x₁ + …). Polis yang aktif setengah tahun otomatis diharapkan punya separuh klaim. Offset tidak muncul di tabel koefisien dan tidak mengatasi overdispersion.</p>",
    "<p>Pada Poisson dengan link log, <code>exp(β)</code> adalah <strong>rasio laju (IRR)</strong>: pengali frekuensi klaim yang diharapkan. 0,916 berarti turun ≈ 8,4% per kenaikan satu kelompok usia. Istilah “odds” (C) hanya untuk logistik.</p>",
    "<p>Poisson mengasumsikan ragam = rata-rata, sehingga dispersi Pearson seharusnya ≈ 1. Nilai 1,409 &gt; 1 menandakan <strong>overdispersion</strong>: standard error Poisson terlalu kecil dan p-value terlalu optimistis. Tindak lanjut: Negative Binomial (<code>MASS::glm.nb()</code>) atau <code>family = quasipoisson</code>.</p>",
    "<p>Gamma dengan link log memberi efek <strong>perkalian pada rata-rata</strong>: <code>exp(β)</code> = 1,201, jadi rata-rata biaya klaim pria ≈ 1,20 kali wanita. Wanita (F) adalah kategori pembanding karena merupakan level pertama menurut abjad. Model ini memodelkan <strong>besar biaya</strong>, bukan peluang klaim (C, D).</p>",
    "<p>Breusch–Pagan menguji H₀: ragam residual konstan (homoskedastis). p-value &lt; 2,2e-16 jauh di bawah 0,05, sehingga H₀ ditolak: ada <strong>heteroskedastisitas</strong>. Normalitas diuji dengan Shapiro–Wilk dan multikolinearitas dengan VIF.</p>",
    "<p><code>plot(model, which = 2)</code> adalah <strong>Normal Q-Q plot</strong>, yang memeriksa normalitas residual. Titik di ujung kanan naik jauh di atas garis, pola khas residual <strong>miring ke kanan</strong>. Ragam konstan dicek dengan Scale-Location (<code>which = 3</code>), bukan Q-Q plot.</p>"
  ],
  posttest: [
    "<p>Response kontinu, <strong>positif</strong>, dan miring ke kanan cocok dengan distribusi Gamma; link log menjaga prediksi tetap positif dan memberi tafsir perkalian. Poisson untuk count, Logistik untuk 0/1, dan Linear mengasumsikan residual Normal dengan ragam konstan, yang dilanggar oleh data biaya.</p>",
    "<p>Family Gamma ditulis dengan <strong>G besar</strong>: <code>Gamma(link = \"log\")</code>. Pilihan B salah karena <code>gamma</code> (huruf kecil) adalah fungsi matematika gamma, bukan family, sehingga R mengeluarkan error. Jika <code>link</code> tidak ditulis, bawaannya <code>inverse</code>. <code>lm()</code> (D) tidak punya argumen <code>family</code>.</p>",
    "<p><code>table()</code> menghitung frekuensi tiap nilai: baris atas adalah <strong>nilai</strong> <code>numclaims</code> (0–4) dan baris bawah adalah <strong>jumlah polis</strong>. Jadi 63.232 polis tanpa klaim, 4.333 polis dengan satu klaim, dan 271 polis dengan dua klaim.</p>",
    "<p><code>genderM</code> adalah variabel dummy: selisih rata-rata response antara pria (M) dan kategori pembanding wanita (F, level pertama menurut abjad). β = 0,321 satuan × 10.000 AUD ≈ 3.210 AUD, dengan predictor lain tetap. Pada model Linear koefisien bukan persentase (A).</p>",
    "<p>Uji F menguji H₀: <strong>semua</strong> koefisien predictor = 0 secara simultan. p-value &lt; 2,2e-16 berarti H₀ ditolak, jadi model lebih baik daripada model tanpa predictor. Uji F tidak menguji tiap koefisien satu per satu (itu uji t), tidak menguji normalitas, dan tidak sama dengan R² (di sini hanya 0,313).</p>",
    "<p>Lihat kolom <code>Pr(&gt;|z|)</code>: hanya <code>genderM</code> yang p-value-nya di atas 0,05 (p = 0,252) dan tidak diberi tanda bintang. <code>exposure</code>, <code>veh_value</code>, dan <code>agecat</code> semuanya bertanda <code>***</code>.</p>",
    "<p><code>exp(β)</code> pada logistik adalah <strong>odds ratio</strong>. OR = 1,055 berarti odds klaim naik (1,055 − 1) × 100% ≈ 5,5% per kenaikan 1 satuan <code>veh_value</code>. Yang dikalikan adalah odds, bukan peluang (A, B), dan efeknya perkalian, bukan penambahan (C).</p>",
    "<p>AIC yang <strong>lebih kecil</strong> lebih baik: <code>model_B</code> = 32477,33 &lt; <code>model_A</code> = 32478,01. Uji rasio likelihood memberi p = 0,252 &gt; 0,05, sehingga menambahkan <code>gender</code> tidak memperbaiki model secara berarti. Keduanya konsisten: pilih model yang lebih sederhana. Kedua model sah dibandingkan karena dipasang pada data yang sama dan bersarang.</p>",
    "<p>Bawaan <code>predict()</code> untuk GLM adalah <code>type = \"link\"</code>, yaitu η = log-odds = -1,9076. Log-odds boleh negatif (artinya peluang &lt; 0,5). Peluangnya: <code>plogis(η)</code> = e^η / (1 + e^η) = 0,129, sama dengan hasil <code>type = \"response\"</code>.</p>",
    "<p>Dengan offset, E[klaim] = exposure × exp(β₀ + β₁x₁ + …). Mengubah exposure dari 1 menjadi 0,5 mengalikan prediksi dengan 0,5: 0,1691 × 0,5 = 0,0846. <code>predict(type = \"response\")</code> sudah memasukkan offset, sehingga <code>exposure</code> wajib ada di <code>newdata</code>.</p>",
    "<p><code>exp(β)</code> = 0,941 adalah pengali frekuensi klaim. Persentase perubahan = (0,941 − 1) × 100% = -5,9%, yaitu turun sekitar 5,9% per kenaikan satu kelompok umur kendaraan.</p>",
    "<p>AIC NB (34806,75) lebih kecil daripada Poisson (34846,37), walaupun NB punya satu parameter tambahan (theta). Pada NB, Var(Y) = μ + μ²/θ: θ yang sangat besar berarti mirip Poisson, sedangkan θ = 2,175 menandakan ada overdispersion. Theta bukan pengali frekuensi (B).</p>",
    "<p>Dummy <code>areaB</code> sampai <code>areaF</code> semuanya dibandingkan dengan <strong>area A</strong> (level pertama, tidak muncul di output), bukan dengan kategori sebelumnya. Pada Gamma log link, <code>exp(β)</code> = 1,436 adalah pengali <strong>rata-rata biaya klaim</strong>. Kategori pembanding bisa diganti dengan <code>relevel()</code>.</p>",
    "<p>Shapiro–Wilk menguji H₀: residual berdistribusi Normal. W = 0,8122 jauh di bawah 1 dan p-value &lt; 2,2e-16, sehingga H₀ ditolak. <code>shapiro.test()</code> hanya menerima maksimal 5.000 data, sehingga diambil sampel acak. Heteroskedastisitas diuji dengan Breusch–Pagan dan autokorelasi dengan Durbin–Watson.</p>",
    "<p><code>plot(model, which = 3)</code> adalah plot <strong>Scale-Location</strong>, yang memeriksa kehomogenan ragam. Garis merah yang datar berarti ragam konstan; di sini garis <strong>naik</strong> dari kiri ke kanan, artinya sebaran residual membesar seiring nilai prediksi. Normalitas dicek dengan Q-Q plot (<code>which = 2</code>).</p>"
  ]
};

/** Dipanggil halaman saat dibuka (pemanasan server) dan bisa dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test GLM aktif." });
}

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
    return out({ ok: true, ver: VER, correct: correct, total: key.length, score: score,
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
