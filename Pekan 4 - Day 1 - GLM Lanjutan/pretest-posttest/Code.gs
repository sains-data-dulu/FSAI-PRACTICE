// Google Apps Script — rekap Pretest & Post-test Pekan 4 Day 1 · GLM Lanjutan · Studi Kasus Caravan ke Google Sheet
// Kunci & pembahasan disimpan di sini (bukan di HTML).
// Pretest: peserta hanya menerima skor. Post-test: peserta menerima skor + kunci + pembahasan.
// Versi bank soal. Halaman tes hanya menampilkan skor bila versi ini cocok dengan VER di HTML.
const VER = "p4d1-1";

// Awalan nama sheet, supaya beberapa hari bisa disalin ke satu spreadsheet tanpa bentrok nama.
const PREFIX = "P4D1 ";

// Soal Pekan 4 Day 1 · GLM Lanjutan · Studi Kasus Caravan — pretest dan post-test memakai soal & kunci yang sama.
const KEY = "CEADBADECBBCEAD".split("");

// Pembahasan per nomor (HTML).
const EXPL = [
    "<p>Dalam soal, propensity modelling adalah pemodelan kecenderungan membeli: p(x) = P(Purchase = Yes | X = x). Skor dapat dipakai untuk ranking. Hubungan dalam data historis belum mengidentifikasi tambahan pembelian akibat kontak, dan probabilitas yang terkalibrasi memerlukan evaluasi tersendiri.</p><p class=\"ox\"><b>A</b> mengubah target menjadi risiko klaim, padahal target yang tersedia adalah pembelian.</p><p class=\"ox\"><b>B</b> adalah propensity score untuk penugasan perlakuan dalam konteks kausal; event yang dimodelkan bukan Purchase.</p><p class=\"ox\"><b>C</b> sesuai dengan target pembelian dan tujuan prioritas pemasaran pada soal.</p><p class=\"ox\"><b>D</b> adalah uplift atau efek perlakuan bersyarat; data eksperimen atau asumsi identifikasi tambahan diperlukan.</p><p class=\"ox\"><b>E</b> adalah model nilai ekonomi. Target itu memerlukan data biaya, klaim, dan margin yang tidak diberikan.</p><p><strong>Pembelian, efek tambahan kontak, dan keuntungan adalah tiga besaran berbeda.</strong></p>",
    "<p>Untuk x dan z, U = 2, P = 0,2%, R = 980/20 = 49, dan dominasi D = 98%. Untuk y, U = 2 dan P = 0,2%, tetapi R = 1 dan D = 50%. Untuk u, U = 1. Var(x) = 0,0196196; Var(z) = 196,196. Perubahan satuan mengubah varians, tetapi tidak mengubah distribusi frekuensi.</p><div class=\"tw\"><table class=\"dt\"><tr><th>Ukuran</th><th>R untuk v tanpa NA</th></tr><tr><td>Varians sampel</td><td>var(v) atau sum((v - mean(v))^2)/(length(v) - 1)</td></tr><tr><td>Jumlah nilai unik U</td><td>length(unique(v))</td></tr><tr><td>Dominasi D</td><td>max(prop.table(table(v)))</td></tr><tr><td>Frekuensi terurut f</td><td>sort(table(v), decreasing = TRUE)</td></tr><tr><td>Rasio R jika U &gt; 1</td><td>as.numeric(f[1]/f[2])</td></tr><tr><td>Persentase unik P</td><td>100 * length(unique(v))/length(v)</td></tr></table></div><p class=\"ox\"><b>A</b> salah: var(z) = 10000 × var(x), sehingga ambang varians mentah memberi keputusan berbeda.</p><p class=\"ox\"><b>B</b> salah: sedikit nilai unik tidak membuktikan dominasi; y adalah prediktor biner seimbang.</p><p class=\"ox\"><b>C</b> membalik pembilang; pada x dan z hasilnya 20/980, bukan 49.</p><p class=\"ox\"><b>D</b> membalik rumus persentase unik; hasilnya 50000%, bukan 0,2%.</p><p class=\"ox\"><b>E</b> memenuhi ketiga kriteria yang ditentukan dan memisahkan kasus konstan dari kasus dua nilai.</p><p><strong>Batas R dan P di soal adalah aturan audit yang ditetapkan, bukan batas universal. Purchase bukan prediktor yang dibuang dengan aturan ini.</strong></p>",
    "<p>Standardisasi J membutuhkan pembagian dengan simpangan baku nol. Kolom J dalam GLM tidak mengidentifikasi koefisien tersendiri; kolom konstan nonnol juga bergantung linear pada intercept. Tree tidak dapat membagi pelanggan menurut J. K berbeda: purchase rate 25% dibanding 55/980 = 5,61%, tetapi hanya ditopang 20 pelanggan.</p><p class=\"ox\"><b>A</b> membedakan kegagalan fitur konstan dari risiko statistik fitur jarang dan mempertahankan peluang sinyal bisnis K.</p><p class=\"ox\"><b>B</b> salah karena centering tidak membuat simpangan baku J menjadi positif; dominasi K tidak membuktikan tidak adanya sinyal.</p><p class=\"ox\"><b>C</b> salah karena intercept tidak memulihkan informasi pada kolom konstan dan PCA terstandardisasi tetap bermasalah.</p><p class=\"ox\"><b>D</b> salah karena tree tidak mengalami pembagian oleh simpangan baku nol; fitur jarang tidak otomatis gagal secara numerik.</p><p class=\"ox\"><b>E</b> salah karena standardisasi dan pruning tidak menjamin kestabilan estimasi atau validitas fitur jarang.</p><p><strong>Audit variasi adalah dasar keputusan metode, bukan alasan menghapus semua karakteristik langka.</strong></p>",
    "<p>Distribusi test harus mencerminkan penggunaan yang hendak dievaluasi. Precision dipengaruhi prevalensi. Dengan sensitivity Se, specificity Sp, dan prevalensi π, precision = Se×π / [Se×π + (1−Sp)×(1−π)]. Menyeimbangkan test mengubah π dan mengubah makna precision untuk populasi asli.</p><p class=\"ox\"><b>A</b> sesuai: stratifikasi menjaga representasi target tanpa menuntut proporsi yang persis sama pada sampel berukuran terbatas.</p><p class=\"ox\"><b>B</b> sesuai: pengurangan No kehilangan informasi; penggandaan Yes tidak menciptakan observasi independen baru.</p><p class=\"ox\"><b>C</b> sesuai: TP = 0 dan tidak ada prediksi Yes, sehingga recall nol dan penyebut precision nol.</p><p class=\"ox\"><b>D</b> tidak sesuai: precision test 50:50 tidak langsung mewakili precision pada populasi dengan 6% Yes.</p><p class=\"ox\"><b>E</b> sesuai: pemilihan threshold harus mendahului evaluasi test dan perubahan sampling dapat menggeser skor probabilitas.</p><p><strong>Resampling ditujukan pada training; evaluasi operasional tetap memakai distribusi populasi yang relevan.</strong></p>",
    "<p>PCA/K-means berbasis jarak membutuhkan representasi numerik yang bermakna, penanganan NA, penghapusan kolom konstan, dan skala yang sebanding. Skor ordinal memerlukan asumsi jarak antarkode. Untuk GLM/tree, tetapkan target dan kategori dengan konsisten; parameter imputasi atau seleksi prediktor diperoleh dari training. Tree tidak memerlukan standardisasi.</p><p class=\"ox\"><b>A</b> memasukkan target ke segmentasi dan menganggap kode nominal memiliki jarak; standardisasi bukan syarat split tree.</p><p class=\"ox\"><b>B</b> sesuai. Untuk segmentasi mandiri, PCA boleh dipelajari pada data segmentasi. Jika menjadi fitur prediksi, PCA juga dipelajari hanya dari training.</p><p class=\"ox\"><b>C</b> membocorkan informasi test melalui imputasi seluruh data dan mengubah distribusi evaluasi melalui resampling test.</p><p class=\"ox\"><b>D</b> mengabaikan dominasi skala pada jarak serta makna kode nominal pada PCA dan GLM.</p><p class=\"ox\"><b>E</b> berisiko ketergantungan dummy lengkap dengan intercept serta penghapusan observasi identik yang belum terbukti duplikat pelanggan.</p><p><strong>Bedakan persiapan segmentasi deskriptif dan persiapan model yang harus digeneralisasikan ke pelanggan baru.</strong></p>",
    "<p>Pertanyaan A meminta distribusi relatif di dalam kelas. Histogram count menggabungkan bentuk distribusi dengan ukuran kelompok. Karena kelas No jauh lebih besar, tinggi batang mentah tidak langsung membandingkan proporsi. Gunakan proporsi per kelas atau normalisasi yang sesuai untuk kode diskret; tampilkan N sebagai konteks.</p><p class=\"ox\"><b>A</b> tidak memadai karena count mentah bukan distribusi relatif. Grafik tersebut sah untuk pertanyaan jumlah absolut, tetapi bukan pertanyaan pada opsi.</p><p class=\"ox\"><b>B</b> memadai untuk median dan penyebaran; informasi nol diperlukan karena boxplot dapat menyembunyikan penumpukan nilai.</p><p class=\"ox\"><b>C</b> memadai untuk perbandingan purchase rate dan ukuran segmen; rate tidak boleh dibaca sebagai efek kepemilikan polis.</p><p class=\"ox\"><b>D</b> memadai karena penyebut dihitung di dalam kelas Purchase sehingga ukuran kelas tidak mendominasi perbandingan.</p><p class=\"ox\"><b>E</b> memadai untuk kategori nominal karena proporsi dihitung dalam kelas, tanpa mengasumsikan jarak antar-subtype.</p><p><strong>Pilih grafik menurut besaran yang ditanyakan: jumlah, proporsi, distribusi, atau rate.</strong></p>",
    "<p>Rate = jumlah Yes dalam kelompok / jumlah pelanggan kelompok. Hasilnya 90/3000 = 3%, 150/1500 = 10%, dan 80/500 = 16%. Baseline = 320/5000 = 6,4%; rate kelompok 2 atau lebih adalah 2,5 kali baseline. Kelompok ini didukung 500 pelanggan dan 80 pembeli, tetapi temuan tetap observasional.</p><p class=\"ox\"><b>A</b> menyamakan banyak pelanggan dengan peluang per kontak; kelompok 0 justru mempunyai rate terendah.</p><p class=\"ox\"><b>B</b> membagi dengan seluruh pembeli, bukan pelanggan kelompok; 150/320 menunjukkan bagian pembeli yang tercakup.</p><p class=\"ox\"><b>C</b> memiliki rate benar, tetapi mengubah selisih antarkelompok menjadi efek kausal setiap tambahan polis.</p><p class=\"ox\"><b>D</b> menghitung penyebut dengan benar dan membatasi rekomendasi pada indikator awal yang perlu divalidasi.</p><p class=\"ox\"><b>E</b> mengabaikan heterogenitas peluang pembelian; baseline tidak menghapus informasi rate bersyarat.</p><p><strong>Rate tinggi perlu dibaca bersama jumlah pelanggan, jumlah pembeli, dan keterbatasan data.</strong></p>",
    "<p>Total varians prediktor terstandardisasi = 13. Proporsi PC1 = 5,2/13 = 40%; kumulatif dua PC = 60%; tiga PC = 70%. rotation berisi eigenvector yang membobot variabel; skor pelanggan berada di pca$x. Untuk variabel terstandardisasi, korelasi variabel–PC1 = 0,40×sqrt(5,20) ≈ 0,912, bukan 0,40.</p><pre class=\"r\">eigenvalue = pca$sdev^2\nproporsi = eigenvalue / sum(eigenvalue)\nwhich(cumsum(proporsi) &gt;= 0.70)[1]</pre><p class=\"ox\"><b>A</b> menukar eigenvalue dengan simpangan baku dan memakai penyebut yang tidak menghasilkan proporsi varians.</p><p class=\"ox\"><b>B</b> menukar bobot dengan persentase serta mengaitkan eigenvalue dengan target yang tidak masuk PCA.</p><p class=\"ox\"><b>C</b> benar pada eigenvalue dan jumlah PC, tetapi salah menyamakan eigenvector dengan korelasi.</p><p class=\"ox\"><b>D</b> menukar bobot variabel dengan skor pelanggan dan mengklaim variasi prediktor sebagai informasi pembelian.</p><p class=\"ox\"><b>E</b> sesuai dengan keluaran prcomp dan batas variasi prediktor yang diminta soal.</p><p><strong>Dalam prcomp, istilah loading merujuk rotation. Sebagian buku memakai loading untuk korelasi; periksa definisinya.</strong></p>",
    "<p>PCA menemukan arah variasi prediktor, bukan arah yang mengoptimalkan pembelian. Pola loading membantu memberi nama tema, lalu profil variabel asli membuat segmen dapat dijelaskan. Rate cluster dua kali baseline adalah asosiasi yang mendukung hipotesis targeting, bukan bukti efek cross-selling. Ukuran cluster dan banyak pembeli perlu dilaporkan.</p><p class=\"ox\"><b>A</b> menamai sumbu sebagai risiko klaim tanpa data klaim dan menyimpulkan kebijakan premi tanpa dasar.</p><p class=\"ox\"><b>B</b> menyamakan variasi prediktor dengan daya prediksi Purchase, padahal target tidak masuk PCA.</p><p class=\"ox\"><b>C</b> menghubungkan pola produk dengan peluang bisnis sambil mempertahankan validasi profil dan rate.</p><p class=\"ox\"><b>D</b> mengubah asosiasi segmen menjadi efek kausal program bundling.</p><p class=\"ox\"><b>E</b> memakai target untuk menyeleksi segmentasi; tidak lagi memenuhi prinsip pemilihan cluster tanpa Purchase pada soal.</p><p><strong>Tanda PC bisa dibalik tanpa mengubah makna struktur; insight berasal dari pola loading, profil asli, dan dukungan segmen.</strong></p>",
    "<p>Rate agregat X = 1 = 112/1000 = 11,2%; X = 0 = 69/1000 = 6,9%. Pada pendapatan rendah, ratenya 4% versus 6%; pada pendapatan tinggi, 12% versus 15%. Kelompok X = 1 jauh lebih banyak berpendapatan tinggi. Pembalikan arah ini adalah contoh paradoks Simpson.</p><p class=\"ox\"><b>A</b> mengklaim pengaruh terkontrol dari perbandingan agregat, padahal arah dalam strata berlawanan.</p><p class=\"ox\"><b>B</b> membaca agregat dan strata dengan tepat. X bisa membantu ranking sebagai proksi, tetapi tambahan nilainya setelah pendapatan belum terbukti.</p><p class=\"ox\"><b>C</b> salah karena rata-rata tertimbang memakai komposisi berbeda; pembalikan agregat dapat terjadi.</p><p class=\"ox\"><b>D</b> memakai seluruh pembeli sebagai penyebut sehingga menghitung cakupan pembeli, bukan rate kelompok.</p><p class=\"ox\"><b>E</b> menutup informasi yang menjelaskan perbedaan komposisi dan tidak membuktikan kelayakan aturan tunggal.</p><p><strong>Indikator awal yang terlihat kuat secara agregat belum tentu menambah informasi setelah profil pelanggan diperhitungkan.</strong></p>",
    "<p>OR mobil = exp(log(1,5)) = 1,5 dan OR pendapatan = 0,75. Dengan asumsi skor linear, kenaikan dua polis dan satu kode memberi faktor odds 1,5²×0,75 = 1,6875. Odds awal = 0,10/0,90 = 1/9; odds baru = 0,1875; p baru = 0,1875/1,1875 = 15,7895%. Ini interpretasi bersyarat model, bukan efek kausal.</p><p class=\"ox\"><b>A</b> memperlakukan odds ratio sebagai pengali probabilitas; hasil 16,875% berasal dari operasi yang salah.</p><p class=\"ox\"><b>B</b> benar pada dua OR, penggabungan perubahan prediktor, dan konversi odds menjadi probabilitas.</p><p class=\"ox\"><b>C</b> mencampur odds dengan poin persentase dan menjumlahkan pengaruh pada skala yang salah.</p><p class=\"ox\"><b>D</b> memakai 2×1,5 untuk dua unit; model logit memerlukan 1,5², bukan 3.</p><p class=\"ox\"><b>E</b> mengartikan kode pendapatan sebagai persentase rupiah dan menyamakan persen perubahan odds dengan poin probabilitas.</p><p><strong>Sebutkan satuan perubahan, kategori acuan bila ada, serta frasa dengan prediktor lain tetap.</strong></p>",
    "<p>AUC mengukur pemisahan ranking lintas seluruh threshold. Interpretasi pasangan adalah P(skor Yes > skor No) + 0,5×P(skor seri). Recall dan precision mengacu pada satu keputusan threshold dan penyebut berbeda. AUC tidak mengukur kalibrasi dan tidak menentukan kualitas ranking tepat pada kuota 20%.</p><p class=\"ox\"><b>A</b> menyamakan AUC dengan accuracy; precision 18% saja tidak mengidentifikasi threshold terlalu rendah.</p><p class=\"ox\"><b>B</b> menyamakan AUC dengan capture pada kuota tertentu yang harus dihitung langsung.</p><p class=\"ox\"><b>C</b> adalah interpretasi probabilistik ranking yang memperhitungkan skor seri.</p><p class=\"ox\"><b>D</b> menyamakan AUC dengan kalibrasi probabilitas individual; recall tidak membuktikan kalibrasi.</p><p class=\"ox\"><b>E</b> salah karena perubahan satu threshold tidak mengubah ranking skor atau AUC keseluruhan.</p><p><strong>Baca AUC, metrik threshold, kalibrasi, dan top 20% sebagai empat aspek yang berbeda.</strong></p>",
    "<p>TP = 60, FN = 60, FP = 280, TN = 1600, N = 2000. Recall = 60/(60+60) = 50%. Specificity = 1600/(1600+280) = 85,11%. Precision = 60/(60+280) = 17,65%. Accuracy = (1600+60)/2000 = 83%.</p><pre class=\"r\">cm = matrix(c(1600, 280, 60, 60), nrow = 2,\n  dimnames = list(Prediksi = c(\"No\", \"Yes\"),\n    Aktual = c(\"No\", \"Yes\")))\ncaret::confusionMatrix(cm, positive = \"Yes\")</pre><p class=\"ox\"><b>A</b> menukar sumbu prediksi dan aktual, sehingga recall tertukar dengan precision dan specificity dihitung dari baris prediksi No.</p><p class=\"ox\"><b>B</b> tiga metrik pertama benar, tetapi accuracy bukan rata-rata accuracy per kelas atau pembagian dengan jumlah aktual No.</p><p class=\"ox\"><b>C</b> menukar specificity dan precision; penyebut keduanya adalah aktual No dan prediksi Yes.</p><p class=\"ox\"><b>D</b> menukar recall dengan precision meskipun specificity dan accuracy benar.</p><p class=\"ox\"><b>E</b> memakai keempat pembilang dan penyebut yang tepat sesuai orientasi tabel.</p><p><strong>Baseline selalu No mencapai 94%, tetapi recall nol. Accuracy 83% tidak otomatis membuat model lebih buruk untuk mencari pembeli.</strong></p>",
    "<p>Capture = 54/120 = 45%. Rate daftar = 54/400 = 13,5%; baseline = 120/2000 = 6%; lift = 13,5%/6% = 2,25. Untuk kuota tepat 20%, lift = capture/0,20. Capture memiliki penyebut semua pembeli, sedangkan rate daftar memiliki penyebut semua pelanggan yang dipilih.</p><p class=\"ox\"><b>A</b> sesuai dengan hitungan dan makna deskriptif kedua ukuran.</p><p class=\"ox\"><b>B</b> menyebut precision atau rate daftar 13,5% sebagai capture seluruh pembeli.</p><p class=\"ox\"><b>C</b> membagi capture dengan baseline rate, padahal lift membandingkan dua purchase rate.</p><p class=\"ox\"><b>D</b> menyamakan porsi kontak dengan cakupan pembeli; pemilihan acak hanya memberi capture 20% secara harapan.</p><p class=\"ox\"><b>E</b> menghitung dengan benar tetapi mengartikan konsentrasi pembeli sebagai efek tambahan kontak yang belum diukur.</p><p><strong>Lift mengukur konsentrasi pembeli dalam daftar, bukan incremental sales akibat kampanye.</strong></p>",
    "<p>M1: capture = 42/120 = 35%; rate top = 42/400 = 10,5%; lift = 10,5%/6% = 1,75. M2: capture = 60/120 = 50%; rate top = 15%; lift = 2,5. Pada biaya dan margin seragam serta kestabilan sebanding, M2 lebih sesuai sebagai kandidat pilot karena daftar dengan kuota sama memuat lebih banyak pembeli aktual.</p><p class=\"ox\"><b>A</b> tidak menghubungkan threshold accuracy dengan anggota top 20%; dominasi kelas No dapat menaikkan accuracy.</p><p class=\"ox\"><b>B</b> salah karena AUC merangkum seluruh ranking dan tidak menjamin keunggulan pada potongan teratas.</p><p class=\"ox\"><b>C</b> menyebut rate daftar 15% sebagai capture serta mengklaim laba tanpa nilai biaya, margin, dan tambahan penjualan.</p><p class=\"ox\"><b>D</b> mengutamakan ukuran yang sesuai kapasitas sambil menjaga interpretabilitas, validasi biaya, dan pilot terkontrol.</p><p class=\"ox\"><b>E</b> mengabaikan perbedaan hasil daftar; AUC dan accuracy masih memberi konteks, meskipun bukan ukuran utama kuota.</p><p><strong>Prioritas model mengikuti keputusan bisnis. Keunggulan pada satu test belum menjamin laba atau kestabilan di periode berikutnya.</strong></p>"
  ];

/** Dibuka saat halaman tes dimuat (pemanasan server); bisa juga dibuka di browser untuk cek versi. */
function doGet() {
  return out({ ok: true, ver: VER, pesan: "API Pretest/Post-test Pekan 4 Day 1 · GLM Lanjutan · Studi Kasus Caravan aktif." });
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
