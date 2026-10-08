/* Pretest & Post-test · BPJS Data Analytics Training — tidak perlu diubah. */
(function () {
  var PAGE = document.body.getAttribute('data-page');
  var N = 15, LETTERS = ['A', 'B', 'C', 'D'];
  var S = { pw: '', nama: '', email: '', jawaban: new Array(N).fill(''), deadline: 0, timerId: null, sending: false, auto: true };
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'bpjs_tes_' + PAGE;

  // Pemanasan server: Google Apps Script butuh beberapa detik untuk "bangun" (cold start).
  // Ping ringan ini dikirim saat halaman dibuka, sehingga saat peserta menekan "Buka" server sudah siap.
  try { if (/^https?:\/\//.test(window.API_URL || '')) fetch(window.API_URL, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(function () {}); } catch (e) {}

  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ pw: S.pw, nama: S.nama, email: S.email, jawaban: S.jawaban })); } catch (e) {} }
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function clear() { try { sessionStorage.removeItem(KEY); } catch (e) {} }

  function call(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (!/^https?:\/\//.test(window.API_URL || '')) return Promise.reject('API_URL belum diatur di assets/config.js.');
    return fetch(window.API_URL, { method: 'POST', body: JSON.stringify({ fn: fn, args: args }) })
      .then(function (r) { return r.json(); }, function () { throw 'Tidak dapat terhubung ke server. Periksa koneksi internet.'; })
      .then(function (j) { if (!j || !j.ok) throw (j && j.error) || 'Terjadi kesalahan di server.'; return j.data; });
  }
  function show(id) {
    ['v-lock', 'v-id', 'v-quiz', 'v-res'].forEach(function (v) { $(v).classList.toggle('hidden', v !== id); });
    $('bar').classList.toggle('hidden', id !== 'v-quiz');
    window.scrollTo(0, 0);
  }
  function busy(btn, on, label) {
    btn.disabled = on;
    if (on) { btn.dataset.l = btn.textContent; btn.innerHTML = '<span class="spin"></span>' + (label || 'Memproses…'); }
    else if (btn.dataset.l) btn.textContent = btn.dataset.l;
  }
  function err(id, msg) { var e = $(id); e.textContent = msg || ''; e.classList.toggle('show', !!msg); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(x) { return x === null || x === undefined || x === '' ? '–' : String(x).replace('.', ','); }

  // 1. kode akses
  // Kode akses tidak dicek terpisah ke server (hemat satu kali tunggu);
  // server memeriksanya sekaligus saat tombol "Mulai" ditekan.
  $('f-lock').addEventListener('submit', function (ev) {
    ev.preventDefault(); err('e-lock');
    var pw = $('pw').value.trim();
    if (!pw) { err('e-lock', 'Kode akses wajib diisi.'); return; }
    S.pw = pw; save(); show('v-id'); $('nama').focus();
  });
  function salahKode(m) { return /kode akses|ditutup/i.test(String(m)); }
  function balikKeKode(m) { S.pw = ''; save(); show('v-lock'); $('pw').value = ''; err('e-lock', m); $('pw').focus(); }
  function setAuto(r) { if (r && typeof r.autoSubmit === 'boolean') { S.auto = r.autoSubmit; $('autonote').classList.toggle('hidden', !r.autoSubmit); } }

  // 2. identitas → mulai
  $('f-id').addEventListener('submit', function (ev) {
    ev.preventDefault(); err('e-id');
    var b = $('b-id');
    S.nama = $('nama').value.trim(); S.email = $('email').value.trim().toLowerCase();
    busy(b, true, 'Menyiapkan soal…');
    call('mulaiTes', PAGE, S.pw, S.nama, S.email).then(function (r) {
      busy(b, false); save(); setAuto(r);
      if (r.sudah) { clear(); renderResult(r.hasil, 'Email ini sudah mengumpulkan ' + r.hasil.judul + '. Berikut hasil Anda.'); return; }
      renderQuiz(r.soal); startTimer(r.sisaDetik); show('v-quiz');
    }).catch(function (m) { busy(b, false); if (salahKode(m)) balikKeKode(m); else err('e-id', m); });
  });

  // 3. soal
  function renderQuiz(soal) {
    var h = '';
    soal.forEach(function (s, i) {
      h += '<div class="card q" id="q' + i + '"><span class="no">Soal ' + s.no + '</span><p>' + esc(s.q) + '</p>';
      if (s.out) h += '<pre>' + esc(s.out) + '</pre>';
      if (s.q2) h += '<p>' + esc(s.q2) + '</p>';
      s.o.forEach(function (o, j) {
        var L = LETTERS[j], sel = S.jawaban[i] === L;
        h += '<label class="opt' + (sel ? ' sel' : '') + '"><input type="radio" name="q' + i + '" value="' + L + '"' + (sel ? ' checked' : '') + '>' +
             '<span class="L">' + L + '</span><span>' + esc(o) + '</span></label>';
      });
      h += '</div>';
    });
    $('qs').innerHTML = h;
    updateProgress();
  }
  $('qs').addEventListener('change', function (ev) {
    var t = ev.target; if (t.type !== 'radio') return;
    var i = Number(t.name.slice(1)); S.jawaban[i] = t.value; save();
    Array.prototype.forEach.call(document.querySelectorAll('input[name="' + t.name + '"]'), function (x) { x.closest('.opt').classList.toggle('sel', x.checked); });
    updateProgress();
  });
  function answered() { return S.jawaban.filter(Boolean).length; }
  function updateProgress() { var a = answered(); $('answered').textContent = a; $('trackfill').style.width = (a / N * 100) + '%'; }

  function startTimer(sisa) {
    S.deadline = Date.now() + sisa * 1000;
    clearInterval(S.timerId);
    var tick = function () {
      var s = Math.max(0, Math.round((S.deadline - Date.now()) / 1000));
      $('timer').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      $('timer').classList.toggle('warn', s <= 60);
      if (s === 0) {
        clearInterval(S.timerId);
        if (S.auto) { $('modal').classList.add('hidden'); submit(true); }
        else $('timer').textContent = 'Waktu habis';
      }
    };
    tick(); S.timerId = setInterval(tick, 1000);
  }

  $('b-submit').addEventListener('click', function () {
    var kosong = N - answered();
    $('m-text').textContent = kosong ? 'Masih ada ' + kosong + ' soal yang belum dijawab. Soal kosong dihitung salah.' : 'Semua soal sudah dijawab. Jawaban tidak dapat diubah setelah dikumpulkan.';
    $('modal').classList.remove('hidden'); $('m-yes').focus();
  });
  $('m-no').addEventListener('click', function () { $('modal').classList.add('hidden'); });
  $('m-yes').addEventListener('click', function () { $('modal').classList.add('hidden'); submit(false); });

  function submit(auto) {
    if (S.sending) return; S.sending = true; err('e-submit');
    var b = $('b-submit'); busy(b, true, auto ? 'Waktu habis, mengumpulkan…' : 'Mengumpulkan…');
    call('kumpulkan', PAGE, S.pw, S.nama, S.email, S.jawaban).then(function (r) {
      clearInterval(S.timerId); clear();
      renderResult(r.hasil, r.duplikat ? 'Email ini sudah pernah mengumpulkan; hasil yang tersimpan ditampilkan.' : (auto ? 'Waktu habis, jawaban Anda telah dikumpulkan otomatis.' : ''));
    }).catch(function (m) { S.sending = false; busy(b, false); err('e-submit', m + ' Silakan coba lagi.'); });
  }

  // 4. hasil
  function renderResult(h, banner) {
    show('v-res');
    $('res-banner').textContent = banner || ''; $('res-banner').classList.toggle('hidden', !banner);
    $('res-title').textContent = 'Hasil ' + h.judul;
    $('res-name').textContent = h.nama + (h.durasi ? ' · waktu pengerjaan ' + Math.floor(h.durasi / 60) + ' menit ' + (h.durasi % 60) + ' detik' : '');
    $('r-skor').textContent = fmt(h.skor);
    $('r-benar').textContent = h.benar + '/' + h.nSoal;
    $('r-rank').textContent = h.peringkat + ' / ' + h.peserta;
    $('r-avg').textContent = fmt(h.rataRata);
    requestAnimationFrame(function () { $('ringfg').style.strokeDashoffset = 427.3 * (1 - (h.skor || 0) / 100); });
    if (h.page === 'posttest') {
      var c = h.banding; $('c-cmp').classList.remove('hidden');
      $('cmp-pre').textContent = c.pre === null ? 'tidak ditemukan' : fmt(c.pre);
      $('cmp-post').textContent = fmt(c.post);
      requestAnimationFrame(function () { $('hb-pre').style.width = (c.pre || 0) + '%'; $('hb-post').style.width = (c.post || 0) + '%'; });
      var d = $('cmp-delta');
      if (c.kenaikan === null) { d.className = 'delta eq'; d.textContent = 'belum bisa dihitung'; $('cmp-sub').textContent = 'Skor pretest untuk email ini tidak ditemukan di spreadsheet. Pastikan email sama dengan saat pretest.'; }
      else { d.className = 'delta ' + (c.kenaikan > 0 ? 'up' : c.kenaikan < 0 ? 'down' : 'eq'); d.textContent = (c.kenaikan > 0 ? '+' : '') + fmt(c.kenaikan) + ' poin'; }
      $('cmp-class').textContent = c.rataPre !== null ? 'Rata-rata kelas: pretest ' + fmt(c.rataPre) + ' → post-test ' + fmt(c.rataPost) + '.' : '';
    }
    renderBoard(h);
  }
  function renderBoard(h) {
    var rows = h.papan.slice(), html = '';
    rows.forEach(function (r) { html += row(r); });
    if (h.peringkat > rows.length) html += '<tr><td colspan="3" style="text-align:center;color:var(--muted)">…</td></tr>' + row({ rank: h.peringkat, skor: h.skor, saya: true });
    $('lb').innerHTML = html || '<tr><td colspan="3">Belum ada data.</td></tr>';
    var t = new Date(h.diperbarui);
    $('src').textContent = 'Data diambil langsung dari Google Spreadsheet · ' + h.peserta + ' peserta · diperbarui ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0');
    $('r-rank').textContent = h.peringkat + ' / ' + h.peserta;
    $('r-avg').textContent = fmt(h.rataRata);
  }
  function row(r) {
    var m = r.rank <= 3 ? ' g' + r.rank : '';
    return '<tr class="' + (r.saya ? 'me' : '') + '"><td><span class="medal' + m + '">' + r.rank + '</span></td><td>' + (r.saya ? 'Anda' : '<span class="anon">Peserta lain</span>') + '</td><td class="num">' + fmt(r.skor) + '</td></tr>';
  }
  $('b-refresh').addEventListener('click', function () {
    var b = this; busy(b, true, 'Memuat…');
    call('lihatHasil', PAGE, S.pw, S.email).then(function (h) {
      busy(b, false); renderBoard(h);
      if (h.page === 'posttest' && h.banding) $('cmp-class').textContent = h.banding.rataPre !== null ? 'Rata-rata kelas: pretest ' + fmt(h.banding.rataPre) + ' → post-test ' + fmt(h.banding.rataPost) + '.' : '';
    }).catch(function () { busy(b, false); });
  });

  // lanjutkan sesi setelah refresh halaman
  var st = load();
  if (st && st.pw) {
    S.pw = st.pw; S.nama = st.nama || ''; S.email = st.email || ''; if (st.jawaban && st.jawaban.length === N) S.jawaban = st.jawaban;
    $('nama').value = S.nama; $('email').value = S.email;
    if (S.nama && S.email) {
      // langsung satu permintaan (sebelumnya dua berurutan)
      call('mulaiTes', PAGE, S.pw, S.nama, S.email).then(function (m) {
        setAuto(m);
        if (m.sudah) { clear(); renderResult(m.hasil, 'Email ini sudah mengumpulkan ' + m.hasil.judul + '. Berikut hasil Anda.'); }
        else { renderQuiz(m.soal); startTimer(m.sisaDetik); show('v-quiz'); }
      }).catch(function (m) { if (salahKode(m)) { clear(); balikKeKode(m); } else show('v-id'); });
    } else show('v-id');
  }
})();
