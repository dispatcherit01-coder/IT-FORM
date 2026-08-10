/* ══════════════════════════════════
   SHARED FORM JS — komunikasi sub-layout ↔ index.html (postMessage)
   + persiapan cetak WYSIWYG (semua data terlihat di output cetak/PDF)
══════════════════════════════════ */
(function () {
  /* ── textarea auto-expand: semua teks yang diketik terlihat penuh di layar & cetak ── */
  function autoGrowAll() {
    document.querySelectorAll('textarea').forEach(function (t) {
      t.style.height = 'auto';
      t.style.height = (t.scrollHeight + 4) + 'px';
    });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.tagName === 'TEXTAREA') autoGrowAll();
  });

  /* ── kabari parent: form siap + tinggi konten (auto-resize iframe) ── */
  function sendReady() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'form-ready',
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      }, '*');
    }
  }
  window.addEventListener('load', function () { autoGrowAll(); sendReady(); });
  window.addEventListener('resize', sendReady);

  /* ── perintah dari parent: print / reset ── */
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'form-print') {
      autoGrowAll();                                   // buka penuh semua textarea sebelum cetak
      setTimeout(function () { window.print(); }, 60); // beri waktu render sesaat
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