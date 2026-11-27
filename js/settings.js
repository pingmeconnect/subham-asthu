/* Sankalpam — live app settings (Phase 7). Loads every rule, fee range, threshold, text and
   WhatsApp template from the database once per page load. Other scripts wait on SASettings.ready().
   Elements with data-setting="<key>" are filled with that text setting ({ta, en}) on load. */
(function () {
  'use strict';

  var DB = window.SADB;
  var values = {};
  var rows = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function get(key) { return values[key]; }
  function int(key) { return Number(values[key]) || 0; }
  function bool(key) { return values[key] === true; }

  // Text setting in one language ('ta' or 'en').
  function text(key, lang) {
    var v = values[key];
    return v && v[lang] ? String(v[lang]) : '';
  }

  // Fills every [data-setting] element with its {ta, en} text, and the support link if set.
  function applyContent() {
    document.querySelectorAll('[data-setting]').forEach(function (el) {
      var v = values[el.getAttribute('data-setting')];
      if (!v || typeof v !== 'object') return;
      el.innerHTML = '<p class="ta">' + esc(v.ta) + '</p><p class="en">' + esc(v.en) + '</p>';
    });
    var support = document.getElementById('support-wa');
    if (support) {
      var num = get('support_whatsapp');
      support.hidden = !num;
      if (num) support.setAttribute('href', 'https://wa.me/91' + esc(num));
    }
  }

  var ready = DB.rpc('sa_get_settings', {}).then(function (list) {
    rows = list || [];
    rows.forEach(function (r) { values[r.key] = r.value; });
  }).catch(function () {
    // Settings unavailable: pages still open; rule-dependent actions are then refused by the server.
  }).then(function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyContent);
    } else {
      applyContent();
    }
    return api;
  });

  var api = {
    ready: function () { return ready; },
    get: get, int: int, bool: bool, text: text,
    rows: function () { return rows; },
    values: function () { return values; },
    reload: function () {
      return DB.rpc('sa_get_settings', {}).then(function (list) {
        rows = list || [];
        values = {};
        rows.forEach(function (r) { values[r.key] = r.value; });
        applyContent();
        return api;
      });
    },
    applyContent: applyContent
  };

  window.SASettings = api;
})();
