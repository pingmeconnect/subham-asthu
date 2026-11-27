/* Sankalpam — editable pooja content. Built-in text (pooja-info.js) is the starting point;
   anything the admin saves in the database replaces that section. Each section is a list of points, Tamil and English apart. */
(function () {
  'use strict';

  // [key, icon, Tamil, English]
  var KEYS = [
    ['start', '⏰', 'தொடங்க நல்ல நேரம்', 'Best time to start'],
    ['who', '👪', 'யார் செய்யலாம்', 'Who can do it'],
    ['need', '🧺', 'தேவையானவை & தயார் செய்யும் முறை (கூடுதல் குறிப்புகள்)', 'What you need & prepare (extra notes)'],
    ['story', '📖', 'ஏன் செய்கிறோம்?', 'Why we do it'],
    ['why', '🌸', 'பலன் (பாரம்பரிய நம்பிக்கை)', 'Benefits (traditional belief)'],
    ['naiv', '🍚', 'நைவேத்தியம்', 'Naivedyam'],
    ['avoid', '⚠️', 'செய்யக் கூடாதவை / கவனிக்க', 'Things to avoid'],
    ['miss', '💛', 'செய்ய இயலவில்லை என்றால்', 'If you cannot do it'],
    ['give', '🤲', 'பூஜைக்குப் பின் தானமாகக் கொடுக்கலாம்', 'You may give after the pooja'],
    ['temples', '🛕', 'புகழ் பெற்ற கோயில்கள்', 'Famous temples'],
    ['tips', '✨', 'கூடுதல் குறிப்புகள்', 'Extra tips']
  ];

  var cache = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function clean(a) { return (a || []).map(function (x) { return String(x).trim(); }).filter(Boolean); }

  function load(force) {
    if (cache && !force) return Promise.resolve(cache);
    return window.SADB.rpc('sa_get_pooja_content', {}).then(function (m) { cache = m || {}; return cache; })
      .catch(function () { cache = {}; return cache; });  // migration not run yet: built-in text only
  }

  // Built-in text of one pooja as {key: {ta: [], en: []}}.
  function defaults(info) {
    var out = {};
    info = info || {};
    KEYS.forEach(function (k) {
      var v = info[k[0]];
      if (!v) { out[k[0]] = { ta: [], en: [] }; return; }
      if (k[0] === 'tips') out.tips = { ta: v.map(function (t) { return t[0]; }), en: v.map(function (t) { return t[1]; }) };
      else out[k[0]] = { ta: [v[0]], en: [v[1]] };
    });
    return out;
  }

  // Admin's saved section wins when it has any point; otherwise the built-in text stays.
  function merged(slug, info) {
    var d = defaults(info), o = (cache && cache[slug]) || {};
    KEYS.forEach(function (k) {
      var s = o[k[0]];
      if (s && (clean(s.ta).length || clean(s.en).length)) d[k[0]] = { ta: clean(s.ta), en: clean(s.en) };
    });
    return d;
  }

  // One or many points; falls back to the other language when one is empty.
  function html(sec) {
    if (!sec) return '';
    var ta = sec.ta.length ? sec.ta : sec.en, en = sec.en.length ? sec.en : sec.ta;
    if (!ta.length) return '';
    if (ta.length <= 1 && en.length <= 1) return '<p><span class="ta">' + esc(ta[0] || '') + '</span><span class="en">' + esc(en[0] || '') + '</span></p>';
    var li = function (a) { return a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); };
    return '<ul class="pj-pts ta">' + li(ta) + '</ul><ul class="pj-pts en">' + li(en) + '</ul>';
  }
  function has(sec) { return !!(sec && (sec.ta.length || sec.en.length)); }

  // For the PDF: every section as one [Tamil, English] pair.
  function flat(m) {
    var o = {};
    KEYS.forEach(function (k) {
      var s = m[k[0]];
      if (has(s)) o[k[0]] = [(s.ta.length ? s.ta : s.en).join(' • '), (s.en.length ? s.en : s.ta).join(' • ')];
    });
    return o;
  }

  window.SAContent = { KEYS: KEYS, load: load, defaults: defaults, merged: merged, html: html, has: has, flat: flat, clean: clean };
})();
