/* Sankalpam — plain-meaning brackets for hard words.
   Example: "Samagri" becomes "Samagri (pooja items)". Edit the two lists below to add or change words.
   English words are matched inside English text, Tamil words inside Tamil text. Each word is explained
   once per line of text, and never twice. */
(function () {
  'use strict';

  // [word (case-insensitive), meaning shown in brackets]
  var EN = [
    ['samagri', 'pooja items'],
    ['naivedyam', 'food offered to God'],
    ['naivedhyam', 'food offered to God'],
    ['kalasam', 'sacred water pot'],
    ['dakshina', 'gift to the priest'],
    ['vratam', 'fasting vow'],
    ['viratham', 'fasting vow'],
    ['samskaras?', 'life-cycle rites'],
    ['homas?|homam', 'sacred fire ritual'],
    ['pitru', 'ancestors'],
    ['archana', 'offering flowers while chanting names'],
    ['sankalpam', 'pooja resolve'],
    ['deepa(?:m)?', 'lamp'],
    ['aarti|deeparadhana', 'waving the lamp before God'],
    ['tarpanam', 'water offering to ancestors'],
    ['muhurtham|muhurat', 'auspicious time'],
    ['prasadam', 'blessed food']
  ];
  var TA = [
    ['நைவேத்தியம்', 'இறைவனுக்குப் படைக்கும் உணவு'],
    ['தட்சிணை', 'வாத்தியாருக்கு அளிக்கும் காணிக்கை'],
    ['கலசம்', 'நீர் நிரப்பிய செம்பு'],
    ['ஹோமங்கள்|ஹோமம்', 'தீயில் செய்யும் வேள்வி'],
    ['சங்கல்பம்', 'பூஜை செய்யும் உறுதிமொழி'],
    ['பித்ரு', 'முன்னோர்'],
    ['தர்ப்பணம்', 'முன்னோர்க்கு எள்ளும் நீரும் அளித்தல்'],
    ['அர்ச்சனை', 'பெயர் சொல்லி மலரிடுதல்'],
    ['தீபாராதனை', 'தீபம் காட்டி வணங்குதல்'],
    ['முகூர்த்தம்', 'நல்ல நேரம்'],
    ['ஸம்ஸ்காரங்கள்|சம்ஸ்காரங்கள்', 'வாழ்க்கைச் சடங்குகள்'],
    ['பிரசாதம்', 'இறைவன் அருள் உணவு']
  ];

  function build(list, isTamil) {
    return list.map(function (p) {
      // Tamil has no \b word edge, so Tamil words are matched as they stand.
      var re = new RegExp((isTamil ? '' : '\\b') + '(' + p[0] + ')' + (isTamil ? '' : '\\b') + '(?!\\s*[(（])', 'i');
      return { re: re, note: p[1] };
    });
  }
  var EN_RE = build(EN, false), TA_RE = build(TA, true);
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, TITLE: 1, CODE: 1 };
  // Menus, headings, buttons, tiles and the running bar stay short and clean; brackets go in the reading text only.
  var SKIP_IN = 'nav, header, button, h1, h2, h3, .sa-ticker, .bottom-nav, .svc-link, .cat-tile, .pg-card, .pg-tools, .pg-rasi, .pg-l, .dl-card, .soon-box, .cal-wrap, .pg-tabs, .brand, .m-panel, .footer-links, .fest-banner, .fest-card';

  function explain(text, rules) {
    var out = text, changed = false;
    rules.forEach(function (r) {
      out = out.replace(r.re, function (m) { changed = true; return m + ' (' + r.note + ')'; });
    });
    return changed ? out : null;
  }

  function pass(root) {
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null);
    var n, todo = [];
    while ((n = w.nextNode())) {
      if (!n.nodeValue || n.nodeValue.length < 4) continue;
      var p = n.parentElement;
      if (!p || SKIP[p.tagName] || p.closest(SKIP_IN)) continue;
      var tag = p.closest('.en, .ta');
      if (!tag) continue;
      todo.push([n, tag.classList.contains('ta')]);
    }
    todo.forEach(function (t) {
      var v = explain(t[0].nodeValue, t[1] ? TA_RE : EN_RE);
      if (v) t[0].nodeValue = v;
    });
  }

  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(function () { pass(); }, 120); }
  pass();
  // Pages are drawn by script after load, so look again whenever the page changes.
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
})();
