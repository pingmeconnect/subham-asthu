/* Subham Asthu — pooja list, pooja detail, samagri order, branded PDF (Phase 3, logo Phase 5).
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
  var LOGO_SRC = 'img/logo.png';

  var mtSize = 1.4;
  function todayStr() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  var DB = window.SADB;
  var P = window.SAPoojas;
  var A = window.SAAuth;

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
    not_found: ['பூஜை கிடைக்கவில்லை.', 'Pooja not found.']
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
  var CAT_COLOR = { daily_monthly: '#7A1C1C', annual_vratam: '#B45309', home_subha_homa: '#2E7D32', samskara_pitru: '#3F5BA9' };

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
          return '<a class="cal-item" style="--cc:' + (CAT_COLOR[r.category] || '#7A1C1C') + '" href="#pooja/' + esc(r.slug) + '"><span>' + bi(esc(r.name_ta), esc(r.name_en)) + '</span>' +
            (x.note_ta || x.note_en ? '<small>' + bi(esc(x.note_ta || x.note_en), esc(x.note_en || x.note_ta)) + '</small>' : '') + '</a>';
        }).join('') + '</div></div>';
    }).join('');
    if (!body) {
      var nxt = cal.mode === 'date' ? dates.filter(function (x) { return x.date > from && by[x.slug]; })[0] : null;
      body = '<p class="ad-empty">' + bi('இந்தக் காலத்தில் பதிவு செய்யப்பட்ட விசேஷங்கள் இல்லை.', 'No special poojas listed for this period.') + '</p>' +
        (nxt ? '<p>' + bi('அடுத்த விசேஷம்: ', 'Next one: ') + '<a href="#pooja/' + esc(nxt.slug) + '">' + bi(esc(by[nxt.slug].name_ta), esc(by[nxt.slug].name_en)) + '</a> - ' + dateLabel(nxt.date) + '</p>' : '');
    }
    var legend = Object.keys(P.CATEGORIES).map(function (c) {
      return '<span class="cal-leg"><i style="background:' + CAT_COLOR[c] + '"></i>' + bi(P.CATEGORIES[c].ta, P.CATEGORIES[c].en) + '</span>';
    }).join('');
    return '<div class="cal-box"><h2>📅 ' + bi('வரும் பூஜைகள் & விசேஷங்கள்', 'Coming poojas & special days') + '</h2>' +
      '<div class="ad-chips">' + chip('30', 'அடுத்த 30 நாள்', 'Next 30 days') + chip('month', 'இந்த மாதம்', 'This month') +
      (tamilMonth(t) ? chip('tamil', 'இந்த தமிழ் மாதம்', 'This Tamil month') : '') + chip('3m', 'அடுத்த 3 மாதம்', 'Next 3 months') + '</div>' +
      '<label class="field cal-pick"><span class="ta">ஒரு தேதியைத் தேர்ந்தெடுத்து அன்றைய விசேஷங்களைப் பாருங்கள்</span><span class="en">Pick a date to see what is special that day</span>' +
      '<input type="date" id="cal-date" min="' + t + '" value="' + esc(cal.date) + '"></label>' +
      '<div class="cal-legend">' + legend + '</div>' + body + '</div>';
  }

  // ---------- List ----------
  function renderList() {
    return Promise.all([P.seed(), loadDates()]).then(function (res) {
      var rows = res[0], dates = res[1];
      var t = todayStr();
      var next = {};
      dates.forEach(function (x) { if (x.date >= t && !next[x.slug]) next[x.slug] = x.date; });
      var html = '<div id="pooja-cal">' + calHtml(rows, dates) + '</div>';
      Object.keys(P.CATEGORIES).forEach(function (cat) {
        var items = rows.filter(function (r) { return r.category === cat; });
        html += '<section class="pooja-group cat-' + cat + '" style="--cc:' + CAT_COLOR[cat] + '"><h2>' + bi(P.CATEGORIES[cat].ta, P.CATEGORIES[cat].en) + '</h2><div class="pooja-grid">';
        items.forEach(function (r) {
          html += '<a class="pooja-card" style="--cc:' + CAT_COLOR[cat] + '" href="#pooja/' + r.slug + '">' +
            '<strong>' + bi(esc(r.name_ta), esc(r.name_en)) + '</strong>' +
            (next[r.slug] ? '<span class="badge cal-next">' + bi('அடுத்து', 'Next') + ': ' + dateLabel(next[r.slug]) + '</span>' : '') +
            (r.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
            '</a>';
        });
        html += '</div></section>';
      });
      var box = $('pooja-list');
      box._rows = rows; box._dates = dates;
      box.innerHTML = html;
      if (!box.dataset.calBound) {
        box.dataset.calBound = '1';
        box.addEventListener('click', function (e) {
          var b = e.target.closest('[data-cal]');
          if (!b) return;
          cal.mode = b.getAttribute('data-cal'); cal.date = '';
          $('pooja-cal').innerHTML = calHtml(box._rows, box._dates);
        });
        box.addEventListener('change', function (e) {
          if (e.target.id !== 'cal-date') return;
          cal.date = e.target.value; cal.mode = cal.date ? 'date' : '30';
          $('pooja-cal').innerHTML = calHtml(box._rows, box._dates);
        });
      }
      box._rows = rows; box._dates = dates;
    });
  }

  // ---------- Detail ----------
  function whenBox(d, slug, dates) {
    var t = todayStr();
    var mine = dates.filter(function (x) { return x.slug === slug && x.date >= t; }).slice(0, 4);
    if (!d.when && !mine.length) return '';
    return '<div class="when-box"><strong>🗓 ' + bi('எப்போது செய்யலாம்?', 'When to do it') + '</strong>' +
      (d.when ? '<p>' + bi(esc(d.when[0]), esc(d.when[1])) + '</p>' : '') +
      (mine.length ? '<p>' + bi('வரும் தேதிகள்', 'Coming dates') + ':</p><div class="badges">' +
        mine.map(function (x) { return '<span class="badge cal-next">' + dateLabel(x.date) + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }

  function renderDetail(slug) {
    var box = $('pooja-detail');
    return Promise.all([P.seed(), loadDates()]).then(function (res) {
      var rows = res[0], dates = res[1];
      var p = rows.filter(function (r) { return r.slug === slug; })[0] || null;
      if (!p) { box.innerHTML = '<p>' + bi(MSG.not_found[0], MSG.not_found[1]) + '</p>'; return; }
      var d = sheetData(p);
      var html = '<a class="back" href="#poojas">' + bi('← பூஜைப் பட்டியல்', '← Pooja list') + '</a>' +
        '<h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>' +
        '<div class="badges">' +
        '<span class="badge">' + bi(P.CATEGORIES[p.category].ta, P.CATEGORIES[p.category].en) + '</span>' +
        (p.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
        (p.is_self_pooja ? '<span class="badge">' + bi('வீட்டிலேயே செய்யலாம்', 'Can be done at home') + '</span>' : '') +
        (d.time ? '<span class="badge">⏱ ' + bi(esc(d.time[0]), esc(d.time[1])) + '</span>' : '') +
        '</div>' +
        whenBox(d, slug, dates) +
        '<h2>' + bi('தேவையான சாமான்கள்', 'What you need') + '</h2>' + checkGrid(d.samagri) +
        '<h2>' + bi('செய்முறை', 'Step by step') + '</h2>' + stepCards(d.steps);

      // Mantra Rule: mantras are shown only in the PDF of self-done poojas; the page shows samagri, steps and timing.
      if (d.mantras.length) {
        html += '<p class="soon">📄 ' + bi('இந்த பூஜைக்கான மந்திரங்கள் (தமிழ் எழுத்தில், பெரிய எழுத்தில்) PDF-இல் மட்டும் உள்ளன. கீழே உள்ள PDF பொத்தானை அழுத்தவும்.', 'The mantras for this pooja (in Tamil script, large print) are only in the PDF. Use the PDF button below.') + '</p>' +
          '<p class="soon disc">' + bi(DISC[0], DISC[1]) + '</p>';
      }

      html += '<div class="action-row">' +
        '<button type="button" class="btn btn-wide" id="btn-pdf">📄 ' + bi('நானே வாங்கிக் கொள்கிறேன் — PDF பதிவிறக்கம்', 'I will buy it myself — Download PDF') + '</button>' +
        '<button type="button" class="btn btn-wide btn-outline" id="btn-order">' + bi('ஆன்லைனில் ஆர்டர் செய்கிறேன்', 'I will order samagri online') + '</button>' +
        '</div>' +
        '<p class="soon">📄 ' + bi('PDF-இல்: அச்சிட்டுப் பயன்படுத்தக்கூடிய, டிக் செய்யும் சாமான் பட்டியல், படிகள், பெரிய எழுத்தில் மந்திரங்கள். கடைக்கு எடுத்துச் செல்லலாம்; வாத்தியார் இல்லாமல் பூஜை செய்யலாம்.', 'The PDF is a printable sheet: a tick-box shopping checklist, the steps and the mantras in large print. Take it to the shop and use it during the pooja.') + '</p>' +
        '<p class="form-msg" id="pdf-msg" role="status" aria-live="polite"></p>' +
        '<form id="order-form" class="order-form" novalidate hidden>' +
        '<label class="field"><span class="ta">டெலிவரி PIN குறியீடு (6 இலக்கம்)</span><span class="en">Delivery PIN code (6 digits)</span>' +
        '<input name="pin" type="text" inputmode="numeric" maxlength="6" required></label>' +
        '<label class="field"><span class="ta">டெலிவரி முகவரி</span><span class="en">Delivery address</span>' +
        '<textarea name="address" rows="3" maxlength="300" required></textarea></label>' +
        '<label class="field"><span class="ta">எப்போது தேவை (தேதி)</span><span class="en">Needed by (date)</span>' +
        '<input name="needed_by" type="date" required></label>' +
        '<label class="field"><span class="ta">குறிப்பு (விருப்பம்)</span><span class="en">Notes (optional)</span>' +
        '<textarea name="notes" rows="2" maxlength="300"></textarea></label>' +
        '<button type="submit" class="btn">' + bi('ஆர்டர் உறுதி செய்', 'Place order') + '</button>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
        '</form>';

      box.innerHTML = html;
      box.dataset.poojaId = p.id;
      $('btn-pdf').addEventListener('click', function () { downloadPdf(p, d); });
      var nb = box.querySelector('input[name="needed_by"]');
      if (nb) nb.min = todayStr();
      box.querySelectorAll('[data-mt-size]').forEach(function (b) {
        b.addEventListener('click', function () {
          mtSize = Math.max(1.1, Math.min(2.2, mtSize + 0.15 * Number(b.getAttribute('data-mt-size'))));
          box.style.setProperty('--mt-size', mtSize + 'rem');
        });
      });
      $('btn-order').addEventListener('click', function () { startOrder(p); });
      $('order-form').addEventListener('submit', function (e) { e.preventDefault(); placeOrder(p, this); });
    });
  }

  // ---------- Samagri order (login required) ----------
  function startOrder(p) {
    A.currentUser().then(function (u) {
      var form = $('order-form');
      if (!u) {
        try { localStorage.setItem(RETURN_KEY, '#pooja/' + p.slug); } catch (e) { /* session only */ }
        setMsg($('pdf-msg'), 'login_first', true);
        location.hash = '#login';
        return;
      }
      form.hidden = !form.hidden;
      if (!form.hidden) form.querySelector('input[name="pin"]').focus();
    });
  }

  function placeOrder(p, form) {
    var out = form.querySelector('.form-msg');
    var d = new FormData(form);
    var pin = String(d.get('pin') || '').trim();
    var address = String(d.get('address') || '').trim();
    var needed = String(d.get('needed_by') || '');
    var notes = String(d.get('notes') || '').trim();
    if (!/^\d{6}$/.test(pin)) return setMsg(out, 'pin_bad', true);
    if (address.length < 10) return setMsg(out, 'address_bad', true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(needed) || needed < todayStr()) return setMsg(out, 'date_bad', true);
    if (notes.length > 300) return setMsg(out, 'notes_bad', true);

    A.currentUser().then(function (u) {
      if (!u) return setMsg(out, 'login_first', true);
      // The server checks the delivery PIN for an active store and queues WhatsApp trigger 1.
      return DB.rpc('sa_place_order', { p_token: DB.token(), p_pooja_slug: p.slug, p_pin: pin,
          p_address: address, p_needed_by: needed, p_notes: notes })
        .then(function (r) {
          if (!r.ok) return setMsg(out, MSG[r.error] ? r.error : 'pin_bad', true);
          form.reset();
          setMsg(out, 'order_ok', false);
        });
    }).catch(function () { setMsg(out, 'pdf_fail', true); });
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
      '<div class="pdf-brand">' + bi('சுபம் அஸ்து', 'Subham Asthu') + '</div>' +
      '<div class="pdf-pn"></div></div>' +
      '<div class="pdf-body">' + (first ? '' : '<div class="pdf-cont">' + titleHtml + '</div>') + '</div>' +
      '<div class="pdf-foot">' +
        '<div class="pdf-foot-brand"><img class="pdf-foot-logo" src="' + LOGO_SRC + '" alt="">' +
        '<strong>' + bi('சுபம் அஸ்து', 'Subham Asthu') + '</strong></div>' +
        '<div>' + watermark() + '</div></div>';
    return page;
  }

  // Atomic blocks (heading + first item stay together). Returns an array of HTML strings.
  function sheetBlocks(p, d) {
    var title = bi(esc(p.name_ta), esc(p.name_en));
    var blocks = ['<h1>' + title + '</h1>' + (d.time ? '<p class="pdf-time">⏱ ' + bi(esc(d.time[0]), esc(d.time[1])) + '</p>' : '') +
      (d.when ? '<p class="pdf-time">🗓 ' + bi(esc(d.when[0]), esc(d.when[1])) + '</p>' : '')];
    var row = function (it) {
      return '<div class="pdf-ck"><span class="ck-ico">' + SELF.icon(it.icon) + '</span><span>' + bi(esc(it.ta), esc(it.en)) + '</span></div>';
    };
    var pairs = [];
    for (var i = 0; i < d.samagri.length; i += 2) {
      pairs.push('<div class="pdf-row2">' + row(d.samagri[i]) + (d.samagri[i + 1] ? row(d.samagri[i + 1]) : '<div></div>') + '</div>');
    }
    pairs[0] = '<h2>' + bi('தேவையான சாமான்கள்', 'What you need') + '</h2>' + pairs[0];
    blocks = blocks.concat(pairs);
    var steps = d.steps.map(function (s, k) {
      return '<div class="pdf-step"><span class="pdf-n">' + (k + 1) + '</span><div>' + bi(esc(s.ta), esc(s.en)) +
        (s.m ? ' <span class="pdf-m">' + bi('மந்திரம் ' + s.m, 'Mantra ' + s.m) + '</span>' : '') + '</div></div>';
    });
    steps[0] = '<h2>' + bi('செய்முறை', 'Step by step') + '</h2>' + steps[0];
    blocks = blocks.concat(steps);
    var mantras = d.mantras.map(function (m, k) {
      return '<div class="pdf-mt"><h3>' + (k + 1) + ' · ' + bi(esc(m.ta), esc(m.en)) + '</h3>' +
        '<div class="pdf-mt-when">' + bi(esc(m.whenTa), esc(m.whenEn)) + ' · ' + bi('எத்தனை முறை', 'Times') + ': ' + esc(m.count) + '</div>' +
        '<div class="pdf-mt-text">' + m.lines.map(esc).join('<br>') + '</div>' +
        '<div class="pdf-mt-mean">' + bi(esc(m.meTa), esc(m.meEn)) + '</div></div>';
    });
    if (mantras.length) {
      mantras[0] = '<h2>' + bi('மந்திரங்கள்', 'Mantras') + '</h2><div class="pdf-disc">' + bi(esc(DISC[0]), esc(DISC[1])) + '</div>' + mantras[0];
      blocks = blocks.concat(mantras);
      blocks.push('<div class="pdf-disc">' + bi(esc(DISC[0]), esc(DISC[1])) + '</div>');
    }
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
      pg.querySelector('.pdf-pn').textContent = (i + 1) + ' / ' + pages.length;
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
    var btn = $('btn-pdf');
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
        return chain.then(function () { doc.save('subham-asthu-' + p.slug + '.pdf'); });
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

  // ---------- Routing ----------
  function route() {
    var hash = location.hash || '';
    if (hash === '#poojas') return renderList();
    if (hash.indexOf('#pooja/') === 0) return renderDetail(hash.slice('#pooja/'.length));
  }

  window.addEventListener('hashchange', route);
  route();
})();
