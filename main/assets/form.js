/* ══════════════════════════════════
   SHARED FORM JS (final — output PDF & WORD saja)
   - PDF dan Word dibangun dari HTML transform YANG SAMA
     (tabel, border inline, lebar kolom, margin narrow 5mm)
     → tampilan PDF 100% sama dengan Word
══════════════════════════════════ */
(function () {
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ── textarea auto-expand ── */
  function autoGrowAll() {
    document.querySelectorAll('textarea').forEach(function (t) {
      t.style.height = 'auto';
      t.style.height = (t.scrollHeight + 4) + 'px';
    });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.tagName === 'TEXTAREA') autoGrowAll();
  });

  function sendReady() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'form-ready',
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) }, '*');
    }
  }
  window.addEventListener('load', function () { autoGrowAll(); sendReady(); });
  window.addEventListener('resize', sendReady);

  /* ── representasi nilai input ── */
  function inputHtml(el) {
    if (el.type === 'checkbox')
      return el.checked ? '<b style="font-size:12px">☑</b>' : '<span style="font-size:12px">☐</span>';
    var v = esc(el.value);
    if (el.classList.contains('sign-input'))
      return '<span style="display:inline-block;width:70%;text-align:center;border-bottom:1px solid #000">' + v + '&nbsp;</span>';
    return '<span>' + v + '&nbsp;</span>';
  }

  /* ── transform flex/grid → tabel ── */
  function transformClone(root) {
    root.querySelectorAll('.sign-wrap').forEach(function (wrap) {
      var header = wrap.querySelector('.sign-header');
      var cols = Array.prototype.slice.call(wrap.querySelectorAll('.sign-col'));
      var n = cols.length || 1;
      var w = Math.floor(100 / n);
      var h = '<table class="exp-sign" cellspacing="0">';
      if (header) {
        h += '<tr><td class="h" colspan="' + n + '">' + esc(header.textContent) + '</td></tr>';
      }
      h += '<tr>';
      cols.forEach(function (c) {
        var r = c.querySelector('.sign-role');
        h += '<td class="r" style="width:' + w + '%">' + esc(r ? r.textContent : '') + '</td>';
      });
      h += '</tr><tr>';
      cols.forEach(function () { h += '<td class="s">&nbsp;</td>'; });
      h += '</tr><tr>';
      cols.forEach(function (c) {
        var i = c.querySelector('.sign-input');
        h += '<td class="nm" style="width:' + w + '%">(' + (i ? inputHtml(i) : '<span>&nbsp;</span>') + ')</td>';
      });
      h += '</tr></table>';
      var tmp = document.createElement('div');
      tmp.innerHTML = h;
      wrap.replaceWith(tmp.firstChild);
    });

    root.querySelectorAll('.box').forEach(function (box) {
      var title = box.querySelector('.box-title');
      var content = box.cloneNode(true);
      content.querySelectorAll('.box-title').forEach(function (x) { x.remove(); });
      var h = '<table class="exp-box" cellspacing="0">';
      if (title) { h += '<tr><td class="bt">' + esc(title.textContent) + '</td></tr>'; }
      h += '<tr><td class="bc">' + content.innerHTML + '</td></tr></table>';
      var tmp = document.createElement('div');
      tmp.innerHTML = h;
      box.replaceWith(tmp.firstChild);
    });

    root.querySelectorAll('.sec-head').forEach(function (sh) {
      var tmp = document.createElement('div');
      tmp.innerHTML = '<table class="exp-sec" cellspacing="0"><tr><td>' + esc(sh.textContent) + '</td></tr></table>';
      sh.replaceWith(tmp.firstChild);
    });
    root.querySelectorAll('.section-gap').forEach(function (g) {
      var tmp = document.createElement('div');
      tmp.innerHTML = '<table class="exp-gap" cellspacing="0"><tr><td>&nbsp;</td></tr></table>';
      g.replaceWith(tmp.firstChild);
    });

    root.querySelectorAll('img').forEach(function (im) {
      im.setAttribute('width', '200');
      im.setAttribute('height', '57');
    });

    var COLW = { 'c-no':'4%', 'c-item':'37%', 'c-cond':'7.5%', 'c-tindak':'20%', 'c-saran':'24%',
                 'c-sw-no':'4%', 'c-sw-item':'38%', 'c-sw-saran':'58%' };
    root.querySelectorAll('col').forEach(function (c) {
      for (var k in COLW) {
        if (c.classList.contains(k)) { c.style.width = COLW[k]; break; }
      }
    });

    root.querySelectorAll('input').forEach(function (inp) {
      var tmp = document.createElement('div');
      tmp.innerHTML = inputHtml(inp);
      inp.replaceWith(tmp.firstChild);
    });
    root.querySelectorAll('textarea').forEach(function (t) {
      var tmp = document.createElement('div');
      tmp.innerHTML = '<div style="white-space:pre-wrap">' + esc(t.value) + '&nbsp;</div>';
      t.replaceWith(tmp.firstChild);
    });

    root.querySelectorAll('script').forEach(function (s) { s.remove(); });
  }

  /* ── border inline menyambung ── */
  function inlineBorders(root) {
    function each(sel, fn){ root.querySelectorAll(sel).forEach(fn); }
    var FULL = 'border:1px solid #000;';

    each('.form-outer', function (el) { el.style.cssText += 'border:none;'; });

    each('table', function (t) {
      t.setAttribute('cellspacing', '0');
      t.style.borderCollapse = 'collapse';
      t.style.width = '100%';
      t.style.margin = '0';
    });

    var tables = root.querySelectorAll('.form-outer table');
    tables.forEach(function (t, idx) {
      if (idx === 0) return;
      var firstRow = t.querySelector('tr');
      if (firstRow) {
        Array.prototype.forEach.call(firstRow.children, function (c) {
          c.style.cssText += 'border-top:none;';
        });
      }
    });

    each('.header-table td', function (c) { c.style.cssText += FULL + 'vertical-align:middle;'; });
    each('.cell-logo',  function (c) { c.style.cssText += 'text-align:center;'; });
    each('.cell-title', function (c) { c.style.cssText += 'text-align:center;vertical-align:middle;'; });

    each('.tbl th, .tbl td, .exp-sign td, .exp-box td, .exp-sec td',
      function (c) { c.style.cssText += FULL; });

    each('table.info-outer > tbody > tr > td',
      function (c) { c.style.cssText += FULL + 'padding:0;vertical-align:top;'; });

    each('table.info-inner td',
      function (c) { c.style.cssText += 'border:none;border-bottom:1px solid #bbb;padding:4px 6px;font-size:12px;'; });

    each('table.meta-table td',
      function (c) { c.style.cssText += 'border:none;border-bottom:1px solid #000;padding:3px 5px;font-size:12px;vertical-align:middle;'; });
    each('table.meta-table .meta-val',
      function (c) { c.style.cssText += 'border-left:1px solid #000;'; });
    each('table.meta-table tr:last-child td',
      function (c) { c.style.cssText += 'border-bottom:none;'; });

    each('table.info-single',
      function (t) { t.style.cssText += 'border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-top:none;'; });
    each('table.info-single td',
      function (c) { c.style.cssText += 'border:none;border-bottom:1px solid #bbb;padding:4px 6px;font-size:12px;'; });
    each('table.info-single tr:last-child td',
      function (c) { c.style.cssText += 'border-bottom:none;'; });

    each('.spacer-row td, .exp-gap td',
      function (c) { c.style.cssText += 'border-left:1px solid #000;border-right:1px solid #000;border-top:none;border-bottom:none;height:9px;'; });
  }

  /* ── CSS bersama PDF & Word (margin NARROW 5mm keduanya) ── */
  var EXPORT_CSS = [
    'body { font-family:Arial,Helvetica,sans-serif; font-size:12px; background:#fff; margin:0; }',
    'table { border-collapse:collapse; width:100%; margin:0; }',
    'td, th { vertical-align:top; font-size:12px; padding:3px 4px; word-wrap:break-word; }',
    '@page { size:A4 portrait; margin:5mm; }',
    '@page WordSection1 { size:595.3pt 841.9pt; margin:14.2pt 14.2pt 14.2pt 14.2pt; }',
    'div.WordSection1 { page:WordSection1; }',
    '.cell-logo { width:215px; text-align:center; } .logo-img { width:200px; height:57px; }',
    '.cell-title { font-size:18px; font-weight:700; text-align:center; vertical-align:middle; }',
    '.cell-meta { width:212px; }',
    '.c-no { width:4%; } .c-item { width:37%; } .c-cond { width:7.5%; }',
    '.c-tindak { width:20%; } .c-saran { width:24%; }',
    '.c-sw-no { width:4%; } .c-sw-item { width:38%; } .c-sw-saran { width:58%; }',
    '.tbl th { font-weight:700; text-align:center; background:#fff; }',
    '.tc-center { text-align:center; }',
    '.exp-sign td { text-align:center; word-wrap:break-word; }',
    '.exp-sign td.h { font-weight:700; } .exp-sign td.s { height:60px; }',
    '.exp-box td.bt { font-weight:700; }',
    '.exp-sec td { font-weight:700; }',
    '.cb-wrap label, .cb-item, .tl-item, .cb-inline { display:block; }',
    '.note-list { font-size:12px; }'
  ].join('\n');

  /* ── bangun body transform (sumber tunggal utk PDF & Word) ── */
  function buildBodyHtml() {
    autoGrowAll();
    var clone = document.body.cloneNode(true);
    transformClone(clone);
    inlineBorders(clone);
    return clone.innerHTML;
  }

  function buildExportHtml(mode) {
    var bodyHtml = buildBodyHtml();
    if (mode === 'word') {
      var mso = '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->';
      var ns = 'xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"';
      return '<html ' + ns + '><head><meta charset="utf-8"/>' + mso +
             '<style>' + EXPORT_CSS + '</style></head><body>' +
             '<div class="WordSection1">' + bodyHtml + '</div></body></html>';
    }
    /* mode 'pdf' : HTML yang sama persis, tanpa wrapper Word */
    return '<html><head><meta charset="utf-8"/><style>' + EXPORT_CSS + '</style></head><body>' + bodyHtml + '</body></html>';
  }

  /* ── WORD : unduh .doc ── */
  function downloadWord() {
    var html = buildExportHtml('word');
    var titleEl = document.querySelector('.cell-title');
    var title = titleEl ? titleEl.textContent.trim() : 'FORM';
    var fname = title.replace(/[^a-z0-9]+/gi, '_') + '.doc';
    var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

    /* ── PDF : otomatis 1 halaman (scale proporsional), tanpa potongan sisi ── */
  function printPdf() {
    var html = buildExportHtml('pdf');
    var f = document.createElement('iframe');
    /* lebar iframe = lebar area cetak A4 @96dpi (210mm − margin 5mm×2 = 200mm ≈ 756px) */
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:756px;height:1150px;border:0;';
    document.body.appendChild(f);
    var w = f.contentWindow;
    var d = w.document;
    d.open();
    d.write(html);
    d.close();

    var done = function () { if (f.parentNode) f.parentNode.removeChild(f); };
    w.onafterprint = done;

    setTimeout(function () {
      /* area cetak A4 portrait, margin narrow 5mm (dalam px @96dpi) */
      var PAGE_W = 756;    /* 200 mm */
      var PAGE_H = 1082;   /* 287 mm − safety 3px */
      var b = d.body;

      /* skala = yang terkecil antara tinggi & lebar agar tidak terpotong di sisi mana pun */
      var k = Math.min(1, PAGE_H / b.scrollHeight, PAGE_W / b.scrollWidth);

      if (k < 1) {                       /* hanya form yang terlalu panjang yang di-scale */
        k = Math.floor(k * 1000) / 1000;
        if ('zoom' in b.style) {
          b.style.zoom = k;              /* Chrome/Edge/Safari/Firefox baru */
        } else {                         /* fallback browser lama */
          b.style.transformOrigin = 'top left';
          b.style.transform = 'scale(' + k + ')';
          b.style.width = (100 / k) + '%';
        }
      }

      w.focus();
      w.print();
      setTimeout(done, 5000);
    }, 300);
  }

  /* ── perintah dari parent ── */
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'form-print') {
      if (window.parent !== window) window.parent.postMessage({ type: 'print-ack' }, '*');
      printPdf();
    } else if (d.type === 'form-export') {
      if (d.format === 'word') {
        if (window.parent !== window) window.parent.postMessage({ type: 'export-ack' }, '*');
        downloadWord();
      }
    } else if (d.type === 'form-reset') {
      if (!confirm(d.msg || 'Reset semua isian form?')) return;
      document.querySelectorAll('input[type=text]').forEach(function (el) {
        el.value = (el.defaultValue === '0') ? '0' : '';
      });
      document.querySelectorAll('textarea').forEach(function (el) { el.value = ''; });
      document.querySelectorAll('input[type=checkbox]').forEach(function (el) { el.checked = false; });
      autoGrowAll();
      sendReady();
    }
  });
})();