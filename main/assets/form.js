/* ══════════════════════════════════
   SHARED FORM JS (final)
   - komunikasi dgn index.html (postMessage)
   - cetak WYSIWYG + export Word(.doc)/Excel(.xls) HTML asli
   - border menyambung (tanpa div), kolom sejajar, logo/judul center
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

  /* ── representasi nilai input untuk export ── */
  function inputHtml(el) {
    if (el.type === 'checkbox')
      return el.checked ? '<b style="font-size:12px">☑</b>' : '<span style="font-size:12px">☐</span>';
    var v = esc(el.value);
    if (el.classList.contains('sign-input'))
      return '<span style="display:inline-block;width:70%;text-align:center;border-bottom:1px solid #000">' + v + '&nbsp;</span>';
    return '<span>' + v + '&nbsp;</span>';
  }

  /* ── transform flex/grid → tabel (Word/Excel friendly) ── */
  function transformClone(root) {
    /* tanda tangan → tabel */
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
        h += '<td class="nm" style="width:' + w + '%">(&nbsp;' + (i ? inputHtml(i) : '') + '&nbsp;)</td>';
      });
      h += '</tr></table>';
      var tmp = document.createElement('div');
      tmp.innerHTML = h;
      wrap.replaceWith(tmp.firstChild);
    });

    /* box → tabel */
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

    /* sec-head & section-gap → tabel */
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

    /* LOGO : ukuran sama dengan UI */
    root.querySelectorAll('img').forEach(function (im) {
      im.setAttribute('width', '200');
      im.setAttribute('height', '57');
    });

    /* lebar kolom inline agar sejajar */
    var COLW = { 'c-no':'4%', 'c-item':'37%', 'c-cond':'7.5%', 'c-tindak':'20%', 'c-saran':'24%',
                 'c-sw-no':'4%', 'c-sw-item':'38%', 'c-sw-saran':'58%' };
    root.querySelectorAll('col').forEach(function (c) {
      for (var k in COLW) {
        if (c.classList.contains(k)) { c.style.width = COLW[k]; break; }
      }
    });

    /* input & textarea → teks */
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

  /* ── BORDER MENYAMBUNG + CENTER (tanpa div pembungkus) ── */
  function inlineBorders(root) {
    function each(sel, fn){ root.querySelectorAll(sel).forEach(fn); }
    var FULL = 'border:1px solid #000;';

    /* div pembungkus TANPA border (hindari kotak kosong di halaman 2);
       garis luar dibentuk oleh border sel tabel → menyambung seperti UI */
    each('.form-outer', function (el) { el.style.cssText += 'border:none;'; });

    each('table', function (t) {
      t.setAttribute('cellspacing', '0');
      t.style.borderCollapse = 'collapse';
      t.style.width = '100%';
      t.style.margin = '0';
    });

    /* anti garis ganda: baris pertama tiap tabel (kecuali yang pertama) tanpa border-top */
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

    /* header: logo & judul CENTER vertical + horizontal */
    each('.header-table td', function (c) { c.style.cssText += FULL + 'vertical-align:middle;'; });
    each('.cell-logo',  function (c) { c.style.cssText += 'text-align:center;'; });
    each('.cell-title', function (c) { c.style.cssText += 'text-align:center;vertical-align:middle;'; });

    /* sel tabel utama ber-border penuh */
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

  /* ── CSS dasar export ── */
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

  /* ── bangun & unduh file export ── */
  function exportDoc(format) {
    autoGrowAll();
    var clone = document.body.cloneNode(true);
    transformClone(clone);
    inlineBorders(clone);
    var bodyHtml = clone.innerHTML;
    var titleEl = document.querySelector('.cell-title');
    var title = titleEl ? titleEl.textContent.trim() : 'FORM';
    var fname = title.replace(/[^a-z0-9]+/gi, '_') + (format === 'word' ? '.doc' : '.xls');

    var mso = '';
    if (format === 'word') {
      mso = '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->';
    } else {
      mso = '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Form</x:Name>' +
            '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    }
    var ns = format === 'word'
      ? 'xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"'
      : 'xmlns:x="urn:schemas-microsoft-com:office:excel"';

    var bodyWrapped = (format === 'word')
      ? '<div class="WordSection1">' + bodyHtml + '</div>'
      : bodyHtml;

    var html = '<html ' + ns + '><head><meta charset="utf-8"/>' + mso +
               '<style>' + EXPORT_CSS + '</style></head><body>' + bodyWrapped + '</body></html>';

    var blob = new Blob(['\ufeff', html], {
      type: format === 'word' ? 'application/msword' : 'application/vnd.ms-excel'
    });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ── perintah dari parent ── */
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'form-print') {
      autoGrowAll();
      if (window.parent !== window) window.parent.postMessage({ type: 'print-ack' }, '*');
      setTimeout(function () { window.print(); }, 60);
    } else if (d.type === 'form-export') {
      if (window.parent !== window) window.parent.postMessage({ type: 'export-ack' }, '*');
      exportDoc(d.format);
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