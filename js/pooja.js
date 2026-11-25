/* Subham Astu — pooja list, pooja detail, samagri order, branded PDF (Phase 3, logo Phase 5).
   Public: list + detail + PDF. Login required only for the samagri order. */
(function () {
  'use strict';

  // Watermark text comes from app_settings (text_pdf_watermark), shown on every PDF page.
  function watermark() {
    return [SASettings.text('text_pdf_watermark', 'ta'), SASettings.text('text_pdf_watermark', 'en')]
      .filter(Boolean).join(' — ');
  }
  var RETURN_KEY = 'subham-asthu-return';
  var JSPDF_SRC = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  var H2C_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
  var LOGO_SRC = 'img/subham-astu-emblem.png';

  var mtSize = 1.4;
  function todayStr() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  var DB = window.SADB;
  var P = window.SAPoojas;
  var A = window.SAAuth;
  var C = window.SAContent;

  // [Tamil, English]
  var MSG = {
    store_none: ['இந்த PIN குறியீட்டுப் பகுதியில் இப்போது கூட்டாளர் கடை இல்லை.', 'No partner store is available in this PIN code area yet.'],
    order_ok: ['ஆர்டர் பதிவு செய்யப்பட்டது. உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது.', 'Order recorded. Waiting for confirmation.'],
    pin_bad: ['சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit PIN code.'],
    login_first: ['ஆர்டர் செய்ய முதலில் உள்நுழையவும்.', 'Please log in first to place an order.'],
    pdf_fail: ['PDF உருவாக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', 'Could not create the PDF. Check your internet connection and try again.'],
    preparing: ['தயாராகிறது…', 'Preparing…'],
    address_bad: ['டெலிவரி முகவரியை முழுமையாக (குறைந்தது 10 எழுத்துகள்) உள்ளிடவும்.', 'Enter the full delivery address (at least 10 characters).'],
    date_bad: ['இன்றோ அதற்குப் பின்னரோ உள்ள தேதியைத் தேர்ந்தெடுக்கவும்.', 'Choose a date today or later.'],
    notes_bad: ['குறிப்பு 300 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Notes must be within 300 characters.'],
    not_found: ['பூஜை கிடைக்கவில்லை.', 'Pooja not found.'],
    mantra_login: ['மந்திரங்களுடன் கூடிய PDF-ஐப் பதிவிறக்க, இலவசமாகப் பதிவு செய்யவும் அல்லது உள்நுழையவும்.', 'To download the mantra PDF, please register free or log in.']
  };

  function bi(ta, en) {
    return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>';
  }

  function $(id) { return document.getElementById(id); }

  function setMsg(el, code, isError) {
    var m = MSG[code];
    el.innerHTML = bi(m[0], m[1]);
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function pairList(items, tag) {
    return '<' + tag + ' class="check-list">' + items.map(function (it) {
      return '<li>' + bi(esc(it[0]), esc(it[1])) + '</li>';
    }).join('') + '</' + tag + '>';
  }

  var SELF = window.SASelf;
  var INFO = window.SAInfo || { get: function () { return null; }, priest: function () { return null; }, OLD: ['', ''], PRIEST_NOTE: ['', ''] };

  // Checklist rows with a small picture: items are { icon, ta, en }.
  function checkGrid(items) {
    return '<ul class="ck-grid">' + items.map(function (it) {
      return '<li><span class="ck-ico">' + SELF.icon(it.icon) + '</span><span class="ck-tx">' + bi(esc(it.ta), esc(it.en)) + '</span></li>';
    }).join('') + '</ul>';
  }

  function legacyItems(rows) {
    return rows.map(function (r) { return { icon: SELF.iconFor(r[0]), ta: r[0], en: r[1] }; });
  }

  function stepCards(steps) {
    return '<ol class="st-list">' + steps.map(function (s) {
      return '<li>' + bi(esc(s.ta), esc(s.en)) +
        '</li>';
    }).join('') + '</ol>';
  }

  function mantraCards(list) {
    return list.map(function (m, i) {
      return '<div class="mt-card"><h3>' + (i + 1) + ' · ' + bi(esc(m.ta), esc(m.en)) + '</h3>' +
        '<div class="badges"><span class="badge">' + bi(esc(m.whenTa), esc(m.whenEn)) + '</span>' +
        '<span class="badge">' + bi('எத்தனை முறை', 'Times') + ': ' + esc(m.count) + '</span></div>' +
        '<div class="mt-text">' + m.lines.map(esc).join('<br>') + '</div>' +
        '<p class="mt-mean">' + bi(esc(m.meTa), esc(m.meEn)) + '</p></div>';
    }).join('');
  }

  // Same data for the page and the PDF: what to show for any pooja.
  function sheetData(p) {
    var self = p.is_self_pooja ? SELF.get(p.slug) : null;
    if (self) return { time: self.time, samagri: self.samagri, steps: self.steps, mantras: self.mantras };
    var c = content(p);
    return {
      time: null,
      samagri: legacyItems(c.samagri),
      steps: c.steps.map(function (s) { return { ta: s[0], en: s[1], m: 0 }; }),
      mantras: []
    };
  }

  function catalogFor(slug) {
    return P.CATALOG.filter(function (c) { return c.slug === slug; })[0] || null;
  }

  function content(p) {
    return P.KINDS[catalogFor(p.slug).kind];
  }


  // ---------- Disclaimer shown with every mantra sheet ----------
  var DISC = ['குறிப்பு: இங்குத் தரப்பட்டுள்ள மந்திரங்கள் பொதுவாக வழக்கத்தில் உள்ளவை; பொது வழிகாட்டுதலுக்காக மட்டுமே. ஒவ்வொரு குடும்பத்திற்கும் தனி வழக்கம் உண்டு. உங்கள் வீட்டுப் பெரியவர்களின் அறிவுறுத்தலின்படியோ, உங்கள் குடும்ப வாத்தியாரின் அறிவுறுத்தலின்படியோ, எப்படிச் செய்ய வேண்டும் என்பதைக் கேட்டுத் தெரிந்து கொண்டு பின்பற்றவும்.',
    'Note: The mantras here are the commonly used ones, given for general guidance only. Every family has its own tradition. Please ask the elders of your home or your family priest how it should be done in your family, and follow their guidance.'];

  // ---------- Dates (entered by the admin from the Tamil panchangam) ----------
  var TA_DAY = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  var EN_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var TA_MON = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
  var EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Tamil month starts that are confirmed; later months show only the English date.
  var TM = [['2026-11-17', 'கார்த்திகை', 'Karthigai'], ['2026-12-16', 'மார்கழி', 'Margazhi'], ['2027-01-15', 'தை', 'Thai']];
  var TM_END = '2027-02-12';
  var CAT_COLOR = { daily_monthly: '#702C35', annual_vratam: '#B18A45', home_subha_homa: '#581E28', samskara_pitru: '#75685B' };

  function parts(ymd) { var a = ymd.split('-'); return new Date(Number(a[0]), Number(a[1]) - 1, Number(a[2])); }
  function fmt(d) { var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x; }
  function addDays(ymd, n) { var d = parts(ymd); d.setDate(d.getDate() + n); return fmt(d); }
  function monthEnd(ymd) { var d = parts(ymd); return fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0)); }
  function tamilMonth(ymd) {
    if (ymd > TM_END) return null;
    var hit = null;
    TM.forEach(function (t) { if (t[0] <= ymd) hit = t; });
    return hit;
  }
  function tamilMonthEnd(ymd) {
    var t = tamilMonth(ymd);
    if (!t) return null;
    var next = TM.filter(function (x) { return x[0] > t[0]; })[0];
    return next ? addDays(next[0], -1) : TM_END;
  }
  function dateLabel(ymd) {
    var d = parts(ymd);
    var tm = tamilMonth(ymd);
    return bi(d.getDate() + ' ' + TA_MON[d.getMonth()] + ' (' + TA_DAY[d.getDay()] + ')' + (tm ? ' · ' + tm[1] : ''),
      EN_DAY[d.getDay()] + ', ' + d.getDate() + ' ' + EN_MON[d.getMonth()] + (tm ? ' · ' + tm[2] : ''));
  }

  var datesCache = null, datesAt = 0;
  function loadDates() {
    if (datesCache && Date.now() - datesAt < 600000) return Promise.resolve(datesCache);
    return DB.rpc('sa_pooja_dates', {}).then(function (r) {
      datesCache = Array.isArray(r) ? r : [];
      datesAt = Date.now();
      return datesCache;
    }).catch(function () { return []; });
  }

  var cal = { mode: '30', date: '' };

  function calHtml(rows, dates) {
    var t = todayStr();
    var by = {};
    rows.forEach(function (r) { by[r.slug] = r; });
    var from = t, to = addDays(t, 30), title;
    if (cal.mode === 'month') to = monthEnd(t);
    if (cal.mode === 'tamil') to = tamilMonthEnd(t) || monthEnd(t);
    if (cal.mode === '3m') to = addDays(t, 92);
    if (cal.mode === 'date') { from = to = cal.date || t; }
    var list = dates.filter(function (x) { return x.date >= from && x.date <= to && by[x.slug]; });
    var groups = {};
    list.forEach(function (x) { (groups[x.date] = groups[x.date] || []).push(x); });
    var chip = function (k, ta, en) {
      return '<button type="button" class="ad-chip' + (cal.mode === k ? ' is-on' : '') + '" data-cal="' + k + '">' + bi(ta, en) + '</button>';
    };
    var body = Object.keys(groups).sort().map(function (d) {
      var d0 = parts(d);
      return '<div class="cal-day"><div class="cal-date"><strong>' + d0.getDate() + '</strong><span>' + EN_MON[d0.getMonth()] + '</span></div><div class="cal-items">' +
        '<div class="cal-dl">' + dateLabel(d) + (d === t ? ' · <b>' + bi('இன்று', 'Today') + '</b>' : '') + '</div>' +
        groups[d].map(function (x) {
          var r = by[x.slug];
          return '<a class="cal-item" style="--cc:' + (CAT_COLOR[r.category] || '#702C35') + '" href="#poojas/' + esc(r.slug) + '"><span>' + bi(esc(r.name_ta), esc(r.name_en)) + '</span>' +
            (x.note_ta || x.note_en ? '<small>' + bi(esc(x.note_ta || x.note_en), esc(x.note_en || x.note_ta)) + '</small>' : '') + '</a>';
        }).join('') + '</div></div>';
    }).join('');
    if (!body) {
      var nxt = cal.mode === 'date' ? dates.filter(function (x) { return x.date > from && by[x.slug]; })[0] : null;
      body = '<p class="ad-empty">' + bi('இந்தக் காலத்தில் பதிவு செய்யப்பட்ட விசேஷங்கள் இல்லை.', 'No special poojas listed for this period.') + '</p>' +
        (nxt ? '<p>' + bi('அடுத்த விசேஷம்: ', 'Next one: ') + '<a href="#poojas/' + esc(nxt.slug) + '">' + bi(esc(by[nxt.slug].name_ta), esc(by[nxt.slug].name_en)) + '</a> - ' + dateLabel(nxt.date) + '</p>' : '');
    }
    var legend = Object.keys(P.CATEGORIES).map(function (c) {
      return '<span class="cal-leg"><i style="background:' + CAT_COLOR[c] + '"></i>' + bi(P.CATEGORIES[c].ta, P.CATEGORIES[c].en) + '</span>';
    }).join('');
    return '<div class="cal-box"><h2>📅 ' + bi('வரும் பூஜைகள் & விசேஷங்கள்', 'Coming poojas & special days') + '</h2>' +
      '<div class="ad-chips">' + chip('30', 'அடுத்த 30 நாள்', 'Next 30 days') + chip('month', 'இந்த மாதம்', 'This month') +
      (tamilMonth(t) ? chip('tamil', 'இந்த தமிழ் மாதம்', 'This Tamil month') : '') + chip('3m', 'அடுத்த 3 மாதம்', 'Next 3 months') + '</div>' +
      '<label class="field cal-pick"><span class="ta">ஒரு தேதியைத் தேர்ந்தெடுத்து அன்றைய விசேஷங்களைப் பாருங்கள்</span><span class="en">Pick a date to see what is special that day</span>' +
      '<input type="date" id="cal-date" min="' + t + '" value="' + esc(cal.date) + '"></label>' +
      '<div class="cal-legend">' + legend + '</div>' + body +
      '<p class="soon">' + bi('தேதிகள் பஞ்சாங்கம் மற்றும் ஊரைப் பொறுத்து மாறலாம். உங்கள் வாத்தியாருடன் உறுதி செய்து கொள்ளவும்.', 'Dates may vary by panchangam and place. Please confirm with your priest.') + '</p></div>';
  }

  // ---------- Browser: categories (left) + details (right) ----------
  function itemHtml(r, next) {
    return '<a class="pj-item" data-sel="' + esc(r.slug) + '" href="#poojas/' + esc(r.slug) + '" data-q="' + esc((r.name_en + ' ' + r.name_ta).toLowerCase()) + '">' +
      '<span>' + bi(esc(r.name_ta), esc(r.name_en)) + '</span>' +
      (next[r.slug] ? '<small>' + bi('அடுத்து', 'Next') + ': ' + dateLabel(next[r.slug]) + '</small>' : '') + '</a>';
  }

  function renderList(sel) {
    return Promise.all([P.seed(), loadDates()]).then(function (res) {
      var rows = res[0], dates = res[1];
      var box = $('pooja-list');
      box._rows = rows; box._dates = dates;
      var selRow = rows.filter(function (r) { return r.slug === sel; })[0];
      var openCat = P.CATEGORIES[sel] ? sel : (selRow ? selRow.category : (box._open || Object.keys(P.CATEGORIES)[0]));
      box._open = openCat;
      if (!box.dataset.built) {
        var t = todayStr(), next = {};
        dates.forEach(function (x) { if (x.date >= t && !next[x.slug]) next[x.slug] = x.date; });
        var tree = '';
        Object.keys(P.CATEGORIES).forEach(function (cat) {
          var items = rows.filter(function (r) { return r.category === cat; });
          tree += '<details class="pj-cat" data-cat="' + cat + '" style="--cc:' + CAT_COLOR[cat] + '"><summary>' + bi(P.CATEGORIES[cat].ta, P.CATEGORIES[cat].en) +
            ' <span class="pj-count">' + items.length + '</span></summary>' + items.map(function (r) { return itemHtml(r, next); }).join('') + '</details>';
        });
        box.innerHTML =
          '<details class="pj-caldet"><summary>🗓 ' + bi('தேதி வாரியாகத் தேட / வரும் பூஜைகள்', 'Find by date / coming poojas') + '</summary><div id="pooja-cal">' + calHtml(rows, dates) + '</div></details>' +
          '<div class="pj-browser" id="pj-browser"><nav class="pj-tree" aria-label="Poojas">' +
          '<input type="search" id="pj-search" class="od-pick-search" placeholder="' + (document.documentElement.getAttribute('data-lang') === 'en' ? 'Search pooja…' : 'பூஜையைத் தேடுக…') + '">' + tree +
          '<p class="soon pj-nomatch" hidden>' + bi('பொருத்தமான பூஜை இல்லை.', 'No matching pooja.') + '</p></nav>' +
          '<div class="pj-pane" id="pooja-pane"></div></div>';
        box.dataset.built = '1';
        box.dataset.calBound = '1';
        box.addEventListener('click', function (e) {
          var b = e.target.closest('[data-cal]');
          if (b) { cal.mode = b.getAttribute('data-cal'); cal.date = ''; $('pooja-cal').innerHTML = calHtml(box._rows, box._dates); return; }
          var it = e.target.closest('[data-sel]');
          if (it) { e.preventDefault(); history.replaceState(null, '', '#poojas/' + it.getAttribute('data-sel')); return showPooja(it.getAttribute('data-sel')); }
          if (e.target.closest('[data-back]')) {
            e.preventDefault(); history.replaceState(null, '', '#poojas');
            $('pj-browser').classList.remove('has-sel');
            $('pooja-pane').innerHTML = emptyPane();
          }
        });
        box.addEventListener('change', function (e) {
          if (e.target.id !== 'cal-date') return;
          cal.date = e.target.value; cal.mode = cal.date ? 'date' : '30';
          $('pooja-cal').innerHTML = calHtml(box._rows, box._dates);
        });
        box.addEventListener('input', function (e) {
          if (e.target.id !== 'pj-search') return;
          var q = e.target.value.trim().toLowerCase(), any = false;
          box.querySelectorAll('.pj-cat').forEach(function (d) {
            var n = 0;
            d.querySelectorAll('.pj-item').forEach(function (a) { var ok = !q || a.getAttribute('data-q').indexOf(q) !== -1; a.hidden = !ok; if (ok) n++; });
            d.hidden = !n; if (q && n) d.open = true; if (n) any = true;
          });
          box.querySelector('.pj-nomatch').hidden = any;
        });
        box.addEventListener('toggle', function (e) {   // one category open at a time
          var d = e.target;
          if (!d.classList || !d.classList.contains('pj-cat') || !d.open || $('pj-search').value) return;
          box.querySelectorAll('.pj-cat').forEach(function (o) { if (o !== d) o.open = false; });
        }, true);
      }
      box.querySelectorAll('.pj-cat').forEach(function (d) { d.open = d.getAttribute('data-cat') === openCat; });
      if (selRow) return showPooja(sel);
      $('pj-browser').classList.remove('has-sel');
      $('pooja-pane').innerHTML = emptyPane();
      var g = P.CATEGORIES[sel] && box.querySelector('.pj-cat[data-cat="' + sel + '"]');
      if (g) g.scrollIntoView({ block: 'start' });
    });
  }

  function emptyPane() {
    return '<div class="pj-empty"><img src="img/kolam-corner.svg" alt="" width="96" height="96"><p>' +
      bi('இடப்பக்கம் உள்ள பிரிவைத் திறந்து, ஒரு பூஜையைத் தேர்ந்தெடுக்கவும். விவரங்கள் இங்கே தெரியும்.', 'Open a category on the left and choose a pooja. Its details will show here.') + '</p></div>';
  }

  function showPooja(slug) {
    var box = $('pooja-list'), pane = $('pooja-pane');
    box.querySelectorAll('.pj-item').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-sel') === slug); });
    $('pj-browser').classList.add('has-sel');
    return renderDetail(slug, pane, true).then(function () {
      if (window.matchMedia('(max-width: 899px)').matches) pane.scrollIntoView({ block: 'start' });
    });
  }

  // ---------- Detail ----------

  function infoFor(p) { return p.is_self_pooja ? INFO.get(p.slug) : INFO.priest(p.slug); }
  function tile(icon, ta, en, valueHtml) {
    return '<div class="pj-tile"><span class="pj-ti">' + icon + '</span><div><small>' + bi(ta, en) + '</small><div>' + valueHtml + '</div></div></div>';
  }
  function box(cls, icon, ta, en, valueHtml) {
    return '<section class="pj-box pj-' + cls + '"><h3><span>' + icon + '</span> ' + bi(ta, en) + '</h3>' + valueHtml + '</section>';
  }
  function pv(pair) { return pair ? '<p>' + bi(esc(pair[0]), esc(pair[1])) + '</p>' : ''; }
  function tipList(tips) {
    return '<ul class="pj-tips">' + tips.map(function (t) { return '<li>' + bi(esc(t[0]), esc(t[1])) + '</li>'; }).join('') + '</ul>';
  }
  function samList(items) {
    return '<ul class="pj-sam">' + items.map(function (it) {
      return '<li><span class="ck-ico">' + SELF.icon(it.icon) + '</span><div><strong>' + bi(esc(it.ta), esc(it.en)) + '</strong>' +
        (it.prep ? '<small>' + bi(esc(it.prep[0]), esc(it.prep[1])) + '</small>' : '') + '</div></li>';
    }).join('') + '</ul>';
  }
  function boxesHtml(m, self) {
    var out = '';
    [['avoid', 'avoid'], ['miss', 'miss'], ['give', 'give'], ['temples', 'temples'], ['tips', 'tips']].forEach(function (x) {
      var k = C.KEYS.filter(function (c) { return c[0] === x[0]; })[0];
      if (C.has(m[x[0]])) out += box(x[1], k[1], k[2], k[3], C.html(m[x[0]]));
    });
    if (self) out += box('custom', '🏠', 'உங்கள் குடும்ப வழக்கம்', 'Your family custom', pv(INFO.OLD));
    out += '<p class="soon">' + bi('சடங்கு முறைகள் குடும்ப மரபு, ஊர் மற்றும் வாத்தியாரைப் பொறுத்து மாறலாம். இது வழிகாட்டுதலுக்கு மட்டுமே; உங்கள் வாத்தியாரின் முடிவே இறுதி.', 'Procedures vary by family tradition, place and priest. This is guidance only; your priest\'s decision is final.') + '</p>';
    return out;
  }

  function whenBox(d, slug, dates) {
    var t = todayStr();
    var mine = dates.filter(function (x) { return x.slug === slug && x.date >= t; }).slice(0, 4);
    if (!d.when && !mine.length) return '';
    return '<div class="when-box"><strong>🗓 ' + bi('எப்போது செய்யலாம்?', 'When to do it') + '</strong>' +
      (d.when ? '<p>' + bi(esc(d.when[0]), esc(d.when[1])) + '</p>' : '') +
      (mine.length ? '<p>' + bi('வரும் தேதிகள்', 'Coming dates') + ':</p><div class="badges">' +
        mine.map(function (x) { return '<span class="badge cal-next">' + dateLabel(x.date) + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }

  function renderDetail(slug, target, embedded) {
    var box = target || $('pooja-detail');
    return Promise.all([P.seed(), loadDates(), C.load()]).then(function (res) {
      var rows = res[0], dates = res[1];
      var p = rows.filter(function (r) { return r.slug === slug; })[0] || null;
      if (!p) { box.innerHTML = '<p>' + bi(MSG.not_found[0], MSG.not_found[1]) + '</p>'; return; }
      var d = sheetData(p);
      var info0 = infoFor(p) || {};
      var m = C.merged(slug, info0);
      var info = C.flat(m);
      if (info0.deity) info.deity = info0.deity;
      var cc = CAT_COLOR[p.category] || '#702C35';
      var t0 = todayStr();
      var mine = dates.filter(function (x) { return x.slug === slug && x.date >= t0; }).slice(0, 3);
      var whenVal = (d.when ? '<p>' + bi(esc(d.when[0]), esc(d.when[1])) + '</p>' : (info.start ? '' : '')) +
        (mine.length ? '<div class="badges">' + mine.map(function (x) { return '<span class="badge cal-next">' + dateLabel(x.date) + '</span>'; }).join('') + '</div>' : '');
      var tiles = '';
      if (whenVal) tiles += tile('🗓', 'எப்போது', 'When', whenVal);
      if (C.has(m.start)) tiles += tile('⏰', 'தொடங்க நேரம்', 'Best time to start', C.html(m.start));
      if (C.has(m.who)) tiles += tile('👪', 'யார் செய்யலாம்', 'Who can do it', C.html(m.who));
      if (C.has(m.naiv)) tiles += tile('🍚', 'நைவேத்தியம்', 'Naivedyam', C.html(m.naiv));
      var html = '<div class="pj" style="--cc:' + cc + '">' +
        '<a class="back' + (embedded ? ' pj-back' : '') + '" href="#poojas"' + (embedded ? ' data-back="1"' : '') + '>' + bi('← பூஜைப் பட்டியல்', '← Pooja list') + '</a>' +
        '<header class="pj-head"><span class="pj-cat">' + bi(P.CATEGORIES[p.category].ta, P.CATEGORIES[p.category].en) + '</span>' +
        '<h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>' +
        (info.deity ? '<p class="pj-deity">🙏 ' + bi(esc(info.deity[0]), esc(info.deity[1])) + '</p>' : '') +
        '<div class="badges">' +
        (p.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
        (p.is_self_pooja ? '<span class="badge">' + bi('வீட்டிலேயே செய்யலாம்', 'Can be done at home') + '</span>' : '') +
        (d.time ? '<span class="badge">⏱ ' + bi(esc(d.time[0]), esc(d.time[1])) + '</span>' : '') +
        '</div>' +
        '@@ACTIONS@@' +
        '</header>' +
        '@@ORDER@@' +
        (tiles ? '<div class="pj-facts">' + tiles + '</div>' : '') +
        '<div class="pj-cols"><section class="pj-card pj-samcard" id="pj-samagri"><h2>🧺 ' + bi('தேவையான சாமான்கள் & தயார் செய்யும் முறை', 'What you need & how to prepare') + '</h2>' + samList(d.samagri) +
        (C.has(m.need) ? '<div class="pj-need">' + C.html(m.need) + '</div>' : '') +
        (p.is_self_pooja ? '' : '<p class="pj-note">' + bi(esc(INFO.PRIEST_NOTE[0]), esc(INFO.PRIEST_NOTE[1])) + '</p>') + '</section>' +
        (C.has(m.story) || C.has(m.why) ? '<section class="pj-card pj-storycard"><h2>📖 ' + bi('ஏன் செய்கிறோம்?', 'Why we do it') + '</h2>' + C.html(m.story) +
          (C.has(m.why) ? '<h3>🌸 ' + bi('செய்தால் கிடைக்கும் பலன்', 'Benefits (traditional belief)') + '</h3>' + C.html(m.why) : '') + '</section>' : '') +
        '</div>' +
        '<section class="pj-card"><h2>🪔 ' + bi('செய்முறை (படிப்படியாக)', 'Step by step') + '</h2>' + stepCards(d.steps) + '</section>';

      // Mantra Rule: mantras are shown only in the PDF of self-done poojas; the page shows samagri, steps and timing.
      if (d.mantras.length) {
        html += '<p class="pj-pdfnote">📿 ' + bi('இந்த பூஜைக்கான மந்திரங்கள் (தமிழ் எழுத்தில், பெரிய எழுத்தில்) மேலே உள்ள PDF-இல் மட்டும் உள்ளன. PDF பதிவிறக்கம் பதிவு செய்த பயனர்களுக்கு மட்டும்.', 'The mantras for this pooja (Tamil script, large print) are only in the PDF at the top. The PDF is for registered users only.') + '</p>';
      }
      html += '<div class="pj-boxes">' + boxesHtml(m, p.is_self_pooja) + '</div>';
      if (d.mantras.length) html += '<p class="soon disc">' + bi(DISC[0], DISC[1]) + '</p>';
      html += '</div>';
      var actions =
        '<section class="pj-opt" id="pj-opt"><h2>🧺 ' + bi('பூஜை சாமான்கள்', 'Pooja samagri') + '</h2>' +
        '<p>' + bi('சாமான்களை எப்படிப் பெற விரும்புகிறீர்கள்?', 'How would you like to get the samagri?') + '</p>' +
        '<div class="action-row pj-actions">' +
        '<button type="button" class="btn btn-wide btn-outline pj-opt-btn" id="btn-self"><span class="pj-opt-ico">🛍️</span><strong>' + bi('நானே வாங்கிக் கொள்கிறேன்', 'I will buy it myself') + '</strong><small>' + (d.mantras.length ? '🔒 ' + bi('பதிவு செய்தவர்களுக்கு: PDF + மந்திரங்கள்', 'Registered users: PDF + mantras') : bi('PDF பதிவிறக்கம்', 'Download PDF')) + '</small></button>' +
        '<button type="button" class="btn btn-wide pj-opt-btn" id="btn-order"><span class="pj-opt-ico">📦</span><strong>' + bi('ஆன்லைனில் ஆர்டர் செய்கிறேன்', 'I will order online') + '</strong><small>' + bi('சாமான்களைத் திருத்தி அனுப்பலாம்', 'Edit the items and send') + '</small></button>' +
        '</div></section>' +
        '<p class="form-msg" id="pdf-msg" role="status" aria-live="polite"></p>';
      html = html.replace('@@ACTIONS@@', actions);
      html = html.replace('@@ORDER@@', '');
      d.info = info;

      box.innerHTML = html;
      box.dataset.poojaId = p.id;
      box.querySelectorAll('[data-mt-size]').forEach(function (b) {
        b.addEventListener('click', function () {
          mtSize = Math.max(1.1, Math.min(2.2, mtSize + 0.15 * Number(b.getAttribute('data-mt-size'))));
          box.style.setProperty('--mt-size', mtSize + 'rem');
        });
      });
      $('btn-order').addEventListener('click', function () { location.hash = '#pooja/' + p.slug + '/order'; });
      $('btn-self').addEventListener('click', function () {
        if (!d.mantras.length) return downloadPdf(p, d);
        // Mantra PDFs are for registered users; the samagri list and steps stay public.
        A.currentUser().then(function (u) {
          if (u) return downloadPdf(p, d);
          try { localStorage.setItem(RETURN_KEY, '#poojas/' + p.slug); } catch (e) { /* session only */ }
          var out = $('pdf-msg');
          out.innerHTML = bi(MSG.mantra_login[0], MSG.mantra_login[1]) + ' <a class="btn btn-outline" href="#login">' + bi('உள்நுழை / பதிவு செய்', 'Log in / Register') + '</a>';
          out.classList.remove('is-ok'); out.classList.add('is-error');
        }).catch(function () { downloadPdf(p, d); });
      });
    });
  }

  // ---------- Online order page: see order.js ----------
  function renderOrder(slug) {
    var box = $('pooja-detail');
    return P.seed().then(function (rows) {
      var p = rows.filter(function (r) { return r.slug === slug; })[0] || null;
      if (!p) { box.innerHTML = '<p>' + bi(MSG.not_found[0], MSG.not_found[1]) + '</p>'; return; }
      var cat = catalogFor(p.slug);
      return window.SAOrderPage.render(box, p, sheetData(p), cat ? cat.kind : 'daily', CAT_COLOR[p.category]);
    });
  }

  // ---------- Branded PDF: automatic page breaks; logo on top, brand + notice at the bottom of EVERY page ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadPdfLibs() {
    if (window.jspdf && window.html2canvas) return Promise.resolve();
    return loadScript(H2C_SRC).then(function () { return loadScript(JSPDF_SRC); });
  }

  function newPage(titleHtml, first) {
    var page = document.createElement('div');
    page.className = 'pdf-page';
    page.innerHTML =
      '<div class="pdf-wm">' + watermark() + '</div>' +
      '<div class="pdf-head"><img class="pdf-logo" src="' + LOGO_SRC + '" alt="">' +
      '<div class="pdf-brandbox"><div class="pdf-brand">சுபம் அஸ்து</div><div class="pdf-brand-en">SUBHAM ASTU</div>' +
      '<div class="pdf-tagline">எல்லாம் மங்களமாகட்டும்!</div></div>' +
      '<div class="pdf-pn"></div></div>' +
      '<div class="pdf-body">' + (first ? '' : '<div class="pdf-cont">' + titleHtml + '</div>') + '</div>' +
      '<div class="pdf-foot">' +
        '<div class="pdf-foot-brand"><strong>சுபம் அஸ்து | SUBHAM ASTU</strong> <span class="pdf-foot-tag">எல்லாம் மங்களமாகட்டும்!</span></div>' +
        '<div>' + watermark() + '</div>' +
        '<div class="pdf-foot-meta"><span>' + (/^https?:/.test(location.protocol) ? esc(location.host) : '') + '</span>' +
        '<span>© ' + new Date().getFullYear() + ' சுபம் அஸ்து</span><span class="pdf-pn"></span></div></div>';
    return page;
  }

  // Mantras PDF (self-done poojas only): starts straight with the pooja. Each step comes with its mantra, in order. No samagri list.
  function sheetBlocks(p, d) {
    var info = d.info || infoFor(p) || {};
    var title = bi(esc(p.name_ta), esc(p.name_en));
    var two = function (pair) { return bi(esc(pair[0]), esc(pair[1])); };
    var blocks = ['<h1>' + title + '</h1>' +
      (info.deity ? '<p class="pdf-deity">' + two(info.deity) + '</p>' : '') +
      '<p class="pdf-time">' + (d.mantras.length ? bi('சாமான்கள், பூஜை முறை & மந்திரங்கள்', 'Samagri, procedure & mantras') : bi('சாமான்கள் & பூஜை முறை', 'Samagri & procedure')) + (d.time ? ' · ⏱ ' + two(d.time) : '') + '</p>'];

    var facts = [];
    if (d.when) facts.push([['எப்போது', 'When'], d.when]);
    if (info.start) facts.push([['தொடங்க நேரம்', 'Best time to start'], info.start]);
    if (info.naiv) facts.push([['நைவேத்தியம்', 'Naivedyam'], info.naiv]);
    if (facts.length) {
      blocks.push('<div class="pdf-facts">' + facts.map(function (f) {
        return '<div class="pdf-fact"><b>' + two(f[0]) + '</b><span>' + two(f[1]) + '</span></div>';
      }).join('') + '</div>');
    }
    if (d.mantras.length) blocks.push('<div class="pdf-disc">' + two(DISC) + '</div>');

    blocks.push('<h2>' + bi('தேவையான சாமான்கள்', 'What you need') + '</h2>');
    d.samagri.forEach(function (it) {
      blocks.push('<div class="pdf-step"><span class="pdf-n">&#9679;</span><div><strong>' + two([it.ta, it.en]) + '</strong>' +
        (it.prep ? '<br><small>' + two(it.prep) + '</small>' : '') + '</div></div>');
    });
    if (!p.is_self_pooja) blocks.push('<div class="pdf-disc">' + two(INFO.PRIEST_NOTE) + '</div>');

    var mantraHtml = function (m, k) {
      return '<div class="pdf-mt"><h3>' + bi('மந்திரம்', 'Mantra') + ' ' + (k + 1) + ' · ' + two([m.ta, m.en]) + '</h3>' +
        '<div class="pdf-mt-when">' + two([m.whenTa, m.whenEn]) + ' · ' + bi('எத்தனை முறை', 'Times') + ': ' + esc(m.count) + '</div>' +
        '<div class="pdf-mt-text">' + m.lines.map(esc).join('<br>') + '</div>' +
        '<div class="pdf-mt-mean">' + two([m.meTa, m.meEn]) + '</div></div>';
    };

    // Steps in order; the mantra of a step is printed right under it.
    var shown = {}, first = true;
    d.steps.forEach(function (s, k) {
      var head = first ? '<h2>' + bi('செய்முறை — தொடக்கம் முதல் முடிவு வரை', 'Procedure — from start to end') + '</h2>' : '';
      first = false;
      var stepHtml = '<div class="pdf-step"><span class="pdf-n">' + (k + 1) + '</span><div>' + two([s.ta, s.en]) + '</div></div>';
      var m = s.m && d.mantras[s.m - 1];
      // The "extra hymns" step only points to the extra hymns that are printed at the end.
      if (m && !shown[s.m] && !/extra hymns/.test(s.en)) {
        shown[s.m] = true;
        blocks.push(head + stepHtml + mantraHtml(m, s.m - 1));
      } else {
        blocks.push(head + stepHtml);
      }
    });

    // Mantras not tied to a step (extra hymns) after the procedure
    var rest = d.mantras.map(function (m, k) { return [m, k]; }).filter(function (x) { return !shown[x[1] + 1]; });
    rest.forEach(function (x, i) {
      blocks.push((i === 0 ? '<h2>' + bi('கூடுதல் துதிகள்', 'Extra hymns') + '</h2>' : '') + mantraHtml(x[0], x[1]));
    });

    var pbox = function (cls, ta, en, html) { return '<div class="pdf-box pdf-box-' + cls + '"><h3>' + bi(ta, en) + '</h3>' + html + '</div>'; };
    if (info.avoid) blocks.push(pbox('avoid', 'செய்யக் கூடாதவை / கவனிக்க', 'Things to avoid', '<p>' + two(info.avoid) + '</p>'));
    if (info.give) blocks.push(pbox('give', 'பூஜைக்குப் பின் தானமாகக் கொடுக்கலாம்', 'You may give after the pooja', '<p>' + two(info.give) + '</p>'));
    if (d.mantras.length) blocks.push('<div class="pdf-disc">' + two(DISC) + '</div>');
    return { blocks: blocks, title: title };
  }

  // Fills fixed-size A4 pages block by block; a block that does not fit starts the next page.
  function paginate(root, sheet) {
    var pages = [], cur = newPage(sheet.title, true);
    root.appendChild(cur); pages.push(cur);
    sheet.blocks.forEach(function (html) {
      var body = cur.querySelector('.pdf-body');
      var wrap = document.createElement('div');
      wrap.className = 'pdf-blk';
      wrap.innerHTML = html;
      body.appendChild(wrap);
      if (body.scrollHeight > body.clientHeight + 1 && body.children.length > 1 + (pages.length > 1 ? 1 : 0)) {
        body.removeChild(wrap);
        cur = newPage(sheet.title, false);
        root.appendChild(cur); pages.push(cur);
        cur.querySelector('.pdf-body').appendChild(wrap);
      }
    });
    pages.forEach(function (pg, i) {
      Array.prototype.forEach.call(pg.querySelectorAll('.pdf-pn'), function (n) { n.textContent = (i + 1) + ' / ' + pages.length; });
    });
    return pages;
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('400 18px "Noto Sans Tamil"'), document.fonts.load('700 18px "Noto Sans Tamil"'),
      document.fonts.load('400 18px "Hind Madurai"'), document.fonts.load('700 18px "Hind Madurai"'),
      document.fonts.load('400 18px "Plus Jakarta Sans"'), document.fonts.load('700 18px "Plus Jakarta Sans"')
    ]).catch(function () { /* fall back to system fonts */ }).then(function () { return document.fonts.ready; });
  }

  function downloadPdf(p, d) {
    var out = $('pdf-msg');
    var btn = $('btn-self');
    btn.disabled = true;
    setMsg(out, 'preparing', false);
    var root = null;

    Promise.all([loadPdfLibs(), fontsReady()]).then(function () {
      root = document.createElement('div');
      root.className = 'pdf-root';
      document.body.appendChild(root);
      var pages = paginate(root, sheetBlocks(p, d));
      var images = Array.prototype.map.call(root.querySelectorAll('img'), function (im) {
        return im.decode ? im.decode().catch(function () { /* drawn as-is */ }) : Promise.resolve();
      });
      return Promise.all(images).then(function () {
        var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        var chain = Promise.resolve();
        pages.forEach(function (el, i) {
          chain = chain.then(function () {
            return window.html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true });
          }).then(function (canvas) {
            if (i > 0) doc.addPage();
            doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
          });
        });
        return chain.then(function () { doc.save('subham-astu-' + p.slug + '.pdf'); });
      });
    }).then(function () {
      out.innerHTML = '';
    }).catch(function () {
      setMsg(out, 'pdf_fail', true);
    }).finally(function () {
      if (root) root.remove();
      btn.disabled = false;
    });
  }

  // ---------- My orders: status, store details once confirmed, feedback ----------
  var ORDER_ST = {
    waiting_for_confirmation: ['உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது', 'Waiting for Confirmation'],
    confirmed_dispatched: ['உறுதி செய்யப்பட்டது / அனுப்பப்பட்டது', 'Confirmed / Dispatched'],
    unavailable: ['கிடைக்கவில்லை', 'Unavailable']
  };
  function loadMyOrders() {
    var el = $('my-orders');
    if (!el) return;
    return DB.rpc('sa_my_orders', { p_token: DB.token() }).then(function (r) {
      var rows = (r && r.orders) || [];
      if (!rows.length) { el.innerHTML = ''; return; }
      el.innerHTML = '<h2>' + bi('என் ஆர்டர்கள்', 'My orders') + '</h2><div class="pooja-grid">' + rows.map(function (o) {
        var st = ORDER_ST[o.status] || ['', ''];
        var shop = o.shop_name ? '<p><strong>' + bi('கடை', 'Store') + ':</strong> ' + esc(o.shop_name) + (o.shop_phone ? ' · <a href="tel:+91' + esc(o.shop_phone) + '">+91 ' + esc(o.shop_phone) + '</a>' : '') + '</p>' +
          '<p class="soon">' + bi('பொருட்கள் வந்த பின் நேரில் பணம் செலுத்தவும்.', 'Pay only after the goods are delivered.') + '</p>' : '';
        return '<article class="pooja-card"><strong>' + bi(esc(o.pooja_ta), esc(o.pooja_en)) + '</strong>' +
          '<div class="badges"><span class="badge">' + bi(st[0], st[1]) + '</span>' + (o.needed_by ? '<span class="badge">📅 ' + esc(o.needed_by) + '</span>' : '') + '</div>' +
          shop + window.SAExtras.feedbackHtml('order', o.id, o.status === 'confirmed_dispatched', o.feedback) + '</article>';
      }).join('') + '</div><hr>';
      window.SAExtras.bindFeedback(el, loadMyOrders);
    }).catch(function () { /* list is optional */ });
  }

  // ---------- Order Samagri entry: login first, then choose the pooja ----------
  function renderOrderPick() {
    var box = $('order-pick');
    return Promise.all([A.currentUser(), P.seed(), DB.rpc('sa_list_offers', {}).catch(function () { return []; })]).then(function (res) {
      var u = res[0], rows = res[1], offers = res[2] || [];
      if (!u) {
        try { localStorage.setItem(RETURN_KEY, '#order'); } catch (e) { /* session only */ }
        box.innerHTML = '<p>' + bi('பூஜை சாமான்களை ஆர்டர் செய்ய, முதலில் உங்கள் மொபைல் எண் மற்றும் PIN மூலம் உள்நுழையவும் அல்லது பதிவு செய்யவும்.',
          'To order pooja samagri, please log in or register with your mobile number and PIN first.') + '</p>' +
          '<div class="action-row"><a class="btn btn-wide" href="#login">' + bi('உள்நுழை / பதிவு செய்', 'Log in / Register') + '</a></div>';
        return;
      }
      var html = '<p class="soon">' + bi('சுபம் அஸ்து உங்களிடம் ஒருபோதும் பணம் கேட்காது. பொருட்கள் வீட்டு வாசலில் வந்த பின் மட்டுமே பணம் செலுத்தவும்.', 'Subham Asthu never asks you for money. Pay only after the goods reach your doorstep.') + '</p>' +
        '<div id="my-orders"></div><p>' + bi('எந்த பூஜைக்குச் சாமான்கள் வேண்டும்? பூஜையைத் தேர்ந்தெடுங்கள்; அடுத்த பக்கத்தில் பட்டியலை மாற்றலாம்.',
        'Which pooja do you need samagri for? Choose it; you can edit the list on the next page.') + '</p>' +
        '<input type="search" id="od-pick-q" class="od-pick-search" placeholder="' + (document.documentElement.getAttribute('data-lang') === 'en' ? 'Search pooja…' : 'பூஜையைத் தேடுக…') + '">';
      if (offers.length) {
        html += '<section class="pooja-group combo-group"><h2>🎁 ' + bi('சிறப்பு நாள் தொகுப்புகள்', 'Special-day combos') + '</h2><div class="pooja-grid">';
        offers.forEach(function (o) {
          var tag = o.pooja_slug ? 'a' : 'div';
          html += '<' + tag + ' class="pooja-card combo-card"' + (o.pooja_slug ? ' href="#pooja/' + esc(o.pooja_slug) + '/order"' : '') + '>' +
            (o.image_url ? '<img class="combo-img" src="' + esc(o.image_url) + '" alt="" loading="lazy">' : '') +
            '<strong>' + bi(esc(o.title_ta), esc(o.title_en)) + '</strong>' +
            (o.text_ta || o.text_en ? '<p>' + bi(esc(o.text_ta || o.text_en), esc(o.text_en || o.text_ta)) + '</p>' : '') +
            (o.pooja_slug ? '<span class="badge cal-next">' + bi('ஆர்டர் செய்ய →', 'Order →') + '</span>' : '') + '</' + tag + '>';
        });
        html += '</div></section>';
      }
      Object.keys(P.CATEGORIES).forEach(function (cat) {
        var items = rows.filter(function (r) { return r.category === cat; });
        html += '<section class="pooja-group cat-' + cat + '" style="--cc:' + CAT_COLOR[cat] + '"><h2>' + bi(P.CATEGORIES[cat].ta, P.CATEGORIES[cat].en) + '</h2><div class="pooja-grid">';
        items.forEach(function (r) {
          html += '<a class="pooja-card" style="--cc:' + CAT_COLOR[cat] + '" href="#pooja/' + r.slug + '/order" data-q="' + esc((r.name_en + ' ' + r.name_ta).toLowerCase()) + '">' +
            '<strong>' + bi(esc(r.name_ta), esc(r.name_en)) + '</strong></a>';
        });
        html += '</div></section>';
      });
      box.innerHTML = html;
      loadMyOrders();
      $('od-pick-q').addEventListener('input', function () {
        var q = this.value.trim().toLowerCase();
        box.querySelectorAll('.pooja-card[data-q]').forEach(function (a) { a.hidden = q && a.getAttribute('data-q').indexOf(q) === -1; });
        box.querySelectorAll('.pooja-group:not(.combo-group)').forEach(function (g) { g.hidden = !g.querySelector('.pooja-card:not([hidden])'); });
      });
    }).catch(function () { box.innerHTML = '<p class="form-msg is-error">' + bi('பக்கத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not load the page. Please try again.') + '</p>'; });
  }

  // ---------- Routing ----------
  function route() {
    var hash = location.hash || '';
    if (hash === '#order') return renderOrderPick();
    if (hash === '#poojas' || hash.indexOf('#poojas/') === 0) {
      return renderList(hash.slice('#poojas/'.length));
    }
    if (hash.indexOf('#pooja/') === 0) {
      var rest = hash.slice('#pooja/'.length);
      if (/\/order$/.test(rest)) return renderOrder(rest.replace(/\/order$/, ''));
      return renderDetail(rest);
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
