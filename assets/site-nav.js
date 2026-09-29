/* ============================================================
   Menu navigasi bersama untuk semua halaman.
   Dipasang di setiap halaman dengan:
     <script src="../assets/site-nav.js" data-current="materi" defer></script>
   Atribut opsional:
     data-current : pretest | materi | handson | latihan | simulasi
     data-side    : right (default) | left
     data-bottom  : jarak dari bawah dalam px (default 20)
   Memakai Shadow DOM agar gaya halaman tidak saling bentrok.
   ============================================================ */
(function () {
  var me = document.currentScript || document.querySelector('script[src*="site-nav.js"]');
  if (!me) return;
  var base = me.src.replace(/assets\/site-nav\.js(\?.*)?$/, '');
  var current = me.getAttribute('data-current') || '';
  var side = me.getAttribute('data-side') === 'left' ? 'left' : 'right';
  var bottom = parseInt(me.getAttribute('data-bottom') || '20', 10);

  var MENU = [
    { id: 'home',     label: 'Beranda',            href: '' },
    { id: 'pretest',  label: 'Pretest – Posttest', href: 'pretest-posttest/' },
    { id: 'materi',   label: 'Materi',             href: 'materi/' },
    { id: 'handson',  label: 'Hands On',           href: 'hands-on/' },
    { id: 'latihan',  label: 'Latihan Soal',       href: 'latihan-soal/' },
    { id: 'simulasi', label: 'Simulasi Soal',      href: 'simulasi-soal/' }
  ];

  function mount() {
    var host = document.createElement('div');
    host.setAttribute('data-site-nav', '');
    host.style.cssText = 'position:fixed;z-index:2147483000;' + side + ':20px;bottom:' + bottom + 'px;';
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

    var items = MENU.map(function (m, i) {
      var cur = m.id === current ? ' aria-current="page"' : '';
      var num = i === 0 ? '' : '<span class="n">' + i + '</span>';
      return '<a href="' + base + m.href + '"' + cur + '>' + num + '<span>' + m.label + '</span></a>';
    }).join('');

    root.innerHTML =
      '<style>' +
      ':host{all:initial}' +
      '*{box-sizing:border-box;font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
      '.fab{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px 0 14px;border:0;border-radius:999px;background:#0B1F4B;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(11,31,75,.35)}' +
      '.fab:hover{background:#2F5BD3}.fab:focus-visible{outline:3px solid #8EC5FF;outline-offset:3px}' +
      '.fab svg{width:18px;height:18px}' +
      '.panel{position:absolute;' + side + ':0;bottom:54px;width:250px;background:#fff;color:#0E1B36;border:1px solid #DCE5F2;border-radius:16px;padding:8px;box-shadow:0 18px 48px rgba(11,31,75,.22);display:none}' +
      '.panel.open{display:block}' +
      '.hd{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#55657F;padding:8px 10px 6px}' +
      'a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;color:#0E1B36;text-decoration:none;font-size:14.5px;font-weight:600}' +
      'a:hover{background:#EEF4FF}a:focus-visible{outline:2px solid #2F5BD3}' +
      'a[aria-current]{background:#2F5BD3;color:#fff}a[aria-current] .n{background:rgba(255,255,255,.2);color:#fff}' +
      '.n{flex:none;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;font-size:12px;font-weight:800;background:#EEF4FF;color:#2F5BD3}' +
      'a:first-of-type .n{display:none}' +
      '@media (prefers-color-scheme:dark){.panel{background:#101E35;color:#E6EDF8;border-color:#223756}a{color:#E6EDF8}a:hover{background:#14284A}.hd{color:#9DB0CC}.n{background:#14284A;color:#8FB0FF}}' +
      '@media print{.fab,.panel{display:none!important}}' +
      '</style>' +
      '<nav class="panel" id="p" aria-label="Menu pelatihan"><div class="hd">Menu pelatihan</div>' + items + '</nav>' +
      '<button class="fab" id="b" type="button" aria-expanded="false" aria-controls="p">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>Menu</button>';

    document.body.appendChild(host);
    var btn = root.getElementById ? root.getElementById('b') : host.querySelector('#b');
    var panel = root.getElementById ? root.getElementById('p') : host.querySelector('#p');
    function set(open) { panel.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!panel.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
