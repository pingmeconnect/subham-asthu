/* Sankalpam — Panchang page + home card + rasi boxes. Uses js/panchang-core.js. */
(function () {
  'use strict';
  var C = window.SAPanchangCore;
  if (!C) return;
  var CITIES = [
    ['சென்னை', 'Chennai', 13.0827, 80.2707], ['மதுரை', 'Madurai', 9.9252, 78.1198], ['கோயம்புத்தூர்', 'Coimbatore', 11.0168, 76.9558],
    ['திருச்சி', 'Tiruchirappalli', 10.7905, 78.7047], ['சேலம்', 'Salem', 11.6643, 78.146], ['திருநெல்வேலி', 'Tirunelveli', 8.7139, 77.7567],
    ['தஞ்சாவூர்', 'Thanjavur', 10.787, 79.1378], ['புதுச்சேரி', 'Puducherry', 11.9416, 79.8083], ['பெங்களூரு', 'Bengaluru', 12.9716, 77.5946],
    ['ஹைதராபாத்', 'Hyderabad', 17.385, 78.4867], ['கொச்சி', 'Kochi', 9.9312, 76.2673], ['திருவனந்தபுரம்', 'Thiruvananthapuram', 8.5241, 76.9366]
  ];
  var KEY = 'subham-asthu-city', city = 0, date = null, word = { good: ['நன்று', 'Good'], avg: ['மிதம்', 'Average'], care: ['கவனம்', 'Careful'] };
  var ICON = { good: '✔', avg: '●', care: '!' };

  function bi(a, b) { return '<span class="ta">' + a + '</span><span class="en">' + b + '</span>'; }
  function two(a) { return bi(a[0], a[1]); }
  function todayIST() { var p = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function add(d, n) { var t = new Date(Date.UTC(d.y, d.m - 1, d.d) + n * 86400000); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function iso(d) { return d.y + '-' + String(d.m).padStart(2, '0') + '-' + String(d.d).padStart(2, '0'); }
  function clock(min) {                       // minutes after midnight -> "6:13 AM" (next-day times marked)
    min = Math.round(min);
    var next = min >= 1440, m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60;
    var s = ((h % 12) || 12) + ':' + String(mm).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM');
    return next ? s + ' <small>(' + '<span class="ta">மறுநாள்</span><span class="en">next day</span>' + ')</small>' : s;
  }
  function range(r) { return clock(r[0]) + ' – ' + clock(r[1]); }
  function tillTxt(min) { return '<small class="pg-till">' + bi('வரை', 'until') + ' ' + clock(min) + '</small>'; }
  function same(d1, d2) { return d1.y === d2.y && d1.m === d2.m && d1.d === d2.d; }
  function load() { try { var v = +localStorage.getItem(KEY); if (v >= 0 && v < CITIES.length) city = v; } catch (e) { /* default */ } }
  function compute(d, at) { var c = CITIES[city]; return C.calc(d, { lat: c[2], lon: c[3] }, at); }
  function nowMin() { var p = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).split(':'); return +p[0] * 60 + +p[1]; }

  // ---------------- Home card ----------------
  function homeCard() {
    var box = document.getElementById('pg-home'); if (!box) return;
    var t = todayIST(), r = compute(t, nowMin());
    box.innerHTML =
      '<div class="pg-home-head"><div><small>' + bi('இன்றைய பஞ்சாங்கம்', "Today's Panchang") + '</small>' +
      '<strong>' + two(r.tamil.month) + ' ' + r.tamil.day + ' · ' + two(r.tamil.day_name) + '</strong></div>' +
      '<a class="btn btn-gold" href="#panchang">' + bi('முழு பஞ்சாங்கம் & ராசி', 'Full Panchang & Rasi') + '</a></div>' +
      '<div class="pg-mini">' +
      '<div><small>' + bi('திதி', 'Tithi') + '</small><b>' + two(r.tithi.name) + '</b><em>' + two(r.tithi.paksha) + '</em></div>' +
      '<div><small>' + bi('நட்சத்திரம்', 'Nakshatra') + '</small><b>' + two(r.nakshatra.name) + '</b></div>' +
      '<div><small>' + bi('ராகு காலம்', 'Rahu Kalam') + '</small><b>' + range(r.rahu) + '</b></div>' +
      '<div><small>' + bi('சூரிய உதயம்', 'Sunrise') + '</small><b>' + clock(r.sunrise) + '</b></div></div>';
    box.hidden = false;
  }

  // ---------------- Page ----------------
  function row(label, val, extra) {
    return '<div class="pg-row"><div class="pg-l">' + label + '</div><div class="pg-v">' + val + (extra || '') + '</div></div>';
  }
  var cur = null;
  function toolsHtml() {
    var opts = CITIES.map(function (c, i) { return '<option value="' + i + '"' + (i === city ? ' selected' : '') + '>' + c[0] + ' / ' + c[1] + '</option>'; }).join('');
    return '<div class="pg-tools">' +
      '<button type="button" class="btn btn-outline" data-pg="-1" aria-label="Previous day">‹ ' + bi('முந்தைய நாள்', 'Previous') + '</button>' +
      '<input type="date" class="pg-date" value="' + iso(date) + '" aria-label="Date">' +
      '<button type="button" class="btn btn-outline" data-pg="1" aria-label="Next day">' + bi('அடுத்த நாள்', 'Next') + ' ›</button>' +
      '<button type="button" class="btn btn-outline" data-pg="0">' + bi('இன்று', 'Today') + '</button>' +
      '<select class="pg-city" aria-label="City">' + opts + '</select></div>';
  }
  function footTxt() {
    return bi('ராசி குறிப்பு சந்திரன் இருக்கும் இடத்தை (சந்திர பலம்) மட்டும் கொண்ட பாரம்பரிய வழிகாட்டி; தனிப்பட்ட ஜாதகப் பலன் அல்ல. நேரங்கள் ' + CITIES[city][0] + ' நகருக்கானவை. கோயில்/சடங்கு நேரங்களுக்கு உங்கள் குடும்பப் பஞ்சாங்கத்தையும் பாருங்கள்; சில பஞ்சாங்கங்களில் தமிழ்த் தேதி ஒரு நாள் மாறுபடலாம். ஜோதிடர் ஆலோசனை விரைவில் வரும்.',
      'Times are for ' + CITIES[city][1] + '. The rasi guide uses only the moon\'s position (Chandra Bala), a traditional guide and not a personal horoscope. For temple or ritual timings please also check your family panchangam; the Tamil date can differ by a day in some almanacs. Astrologer consultation is coming soon.');
  }
  // Homepage rasi cards: today's result for each rasi, from the same calculation as the Rasi page.
  function fillHomeRasi() {
    if (!cur) return;
    var cards = document.querySelectorAll('.v2-rcard');
    cards.forEach(function (card, i) {
      var p = card.querySelector('.pv'); if (!p || i > 11) return;
      var w = word[C.chandraBala(i, cur.moonRasi.i).word];
      p.innerHTML = '<span class="ta">இன்று: ' + w[0] + '</span><span class="en">Today: ' + w[1] + '</span>';
    });
  }

  function rasiPage() {
    var box = document.getElementById('pg-rasi'); if (!box || !cur) return;
    var r = cur, h = toolsHtml() + '<div class="pg-title"><strong>' + two(r.tamil.month) + ' ' + r.tamil.day + '</strong> · ' + two(r.tamil.day_name) + '</div>' +
      '<p class="pg-sub">' + bi('சந்திரன் இன்று: ', 'Moon today: ') + '<b>' + two([r.moonRasi.ta, r.moonRasi.en]) + '</b> · ' + bi('உங்கள் ராசியைத் தொடுங்கள்; விவரம் தனிப் பெட்டியில் வரும்.', 'Tap your rasi to open its box.') + '</p><div class="pg-rasi">';
    for (var i = 0; i < 12; i++) {
      var cb = C.chandraBala(i, r.moonRasi.i);
      h += '<button type="button" class="pg-r pg-' + cb.word + '" data-rasi="' + i + '"><span class="pg-rn">' + two([C.RASI_TA[i], C.RASI_EN[i].split(' ')[0]]) + '</span>' +
        '<span class="pg-rw"><i aria-hidden="true">' + ICON[cb.word] + '</i> ' + two(word[cb.word]) + '</span>' + (function () { var t = transit(i); return t && t.sani.k !== 'n' ? '<span class="pg-rs">' + bi('சனி: ' + (t.sani.k === 'e' ? 'ஏழரை' : 'அஷ்டமம் / அர்த்தாஷ்டமம்'), 'Saturn: ' + (t.sani.k === 'e' ? 'Ezharai' : 'Ashtama / Ardhashtama')) + '</span>' : ''; })() + '</button>';
    }
    h += '</div><p class="pg-foot">' + footTxt() + '</p>';
    box.innerHTML = h;
    fillHomeRasi();
  }
  function page() {
    var box = document.getElementById('pg-page'); if (!box) return;
    var isToday = same(date, todayIST()), r = compute(date, isToday ? nowMin() : 720);
    var opts = CITIES.map(function (c, i) { return '<option value="' + i + '"' + (i === city ? ' selected' : '') + '>' + c[0] + ' / ' + c[1] + '</option>'; }).join('');
    var h = toolsHtml();
    h += '<div class="pg-title"><strong>' + two(r.tamil.month) + ' ' + r.tamil.day + '</strong> · ' + two(r.tamil.day_name) +
      '<br><small>' + date.d + '-' + date.m + '-' + date.y + '</small></div>';
    h += '<div class="pg-table">' +
      row(bi('திதி', 'Tithi'), '<b>' + two(r.tithi.name) + '</b> · ' + two(r.tithi.paksha), tillTxt(r.tithi.end)) +
      row(bi('நட்சத்திரம்', 'Nakshatra (birth star of the day)'), '<b>' + two(r.nakshatra.name) + '</b> · ' + bi('பாதம்', 'pada') + ' ' + r.nakshatra.pada, tillTxt(r.nakshatra.end)) +
      row(bi('யோகம்', 'Yoga'), '<b>' + two(r.yoga.name) + '</b>', tillTxt(r.yoga.end)) +
      row(bi('கரணம்', 'Karanam'), '<b>' + two(r.karana.name) + '</b>', tillTxt(r.karana.end)) +
      row(bi('சந்திரன் ராசி', 'Moon in rasi'), '<b>' + two([r.moonRasi.ta, r.moonRasi.en]) + '</b>', tillTxt(r.moonRasi.until)) +
      row(bi('சூரிய உதயம் / அஸ்தமனம்', 'Sunrise / Sunset'), '<b>' + clock(r.sunrise) + '</b> / <b>' + clock(r.sunset) + '</b>') +
      '</div>';
    h += '<h2 class="pg-h">' + bi('நல்ல நேரம் & தவிர்க்கும் நேரம்', 'Good and avoid times') + '</h2><div class="pg-table">' +
      row(bi('பிரம்ம முகூர்த்தம் (அதிகாலை வழிபாட்டு நேரம்)', 'Brahma Muhurtham (early-morning prayer time)'), '<b class="pg-good">' + range(r.brahma) + '</b>') +
      row(bi('அபிஜித் முகூர்த்தம் (நல்ல நேரம்)', 'Abhijit Muhurtham (good time to start)'), '<b class="pg-good">' + range(r.abhijit) + '</b>') +
      row(bi('ராகு காலம் (புதிய வேலை தவிர்க்கவும்)', 'Rahu Kalam (avoid new work)'), '<b class="pg-bad">' + range(r.rahu) + '</b>') +
      row(bi('எமகண்டம் (தவிர்க்கவும்)', 'Yamagandam (avoid)'), '<b class="pg-bad">' + range(r.yama) + '</b>') +
      row(bi('குளிகை (தவிர்க்கவும்)', 'Kuligai (avoid)'), '<b class="pg-bad">' + range(r.kuligai) + '</b>') +
      '</div>';
    h += '<p class="pg-go"><a class="btn btn-gold" href="#rasi">' + bi('இன்றைய ராசி பலன் பார்க்க ›', "See today's Rasi Palan ›") + '</a></p>';
    h += '<p class="pg-foot">' + footTxt() + '</p>';
    box.innerHTML = h;
    cur = r;
    rasiPage();
  }


  // ---- Sani / Guru transit status for a rasi (from real planet positions; needs js/astro-core.js) ----
  var ASTRO = function () { return window.SAAstro; };
  function transit(i) {
    var A = ASTRO(); if (!A || !date) return null;
    var J = window.SAPanchangCore._t.jd(date.y, date.m, date.d, 0) + (720 - 330) / 1440;
    var sa = Math.floor(A.sidereal('sa', J) / 30), ju = Math.floor(A.sidereal('ju', J) / 30);
    var hs = ((sa - i) % 12 + 12) % 12 + 1, hj = ((ju - i) % 12 + 12) % 12 + 1, sani;
    if (hs === 12) sani = { k: 'e', ph: 1, ta: 'ஏழரைச் சனி - முதல் கட்டம் (12-ஆம் இடம்)', en: 'Ezharai Sani (7½ years) - 1st phase (Saturn in 12th)' };
    else if (hs === 1) sani = { k: 'e', ph: 2, ta: 'ஏழரைச் சனி - இரண்டாம் கட்டம் (ஜென்ம ராசி)', en: 'Ezharai Sani - 2nd phase (Saturn over your rasi)' };
    else if (hs === 2) sani = { k: 'e', ph: 3, ta: 'ஏழரைச் சனி - மூன்றாம் கட்டம் (2-ஆம் இடம்)', en: 'Ezharai Sani - 3rd phase (Saturn in 2nd)' };
    else if (hs === 8) sani = { k: 'a', ta: 'அஷ்டமச் சனி (8-ஆம் இடம்)', en: 'Ashtama Sani (Saturn in 8th)' };
    else if (hs === 4) sani = { k: 'a', ta: 'அர்த்தாஷ்டமச் சனி (4-ஆம் இடம்)', en: 'Ardhashtama Sani (Saturn in 4th)' };
    else sani = { k: 'n', ta: 'பெரிய சனிக் காலம் எதுவும் இல்லை', en: 'No major Saturn period now' };
    var gGood = [2, 5, 7, 9, 11].indexOf(hj) !== -1;
    return { sani: sani, hs: hs, hj: hj, saR: sa, juR: ju, guru: gGood ? { ta: 'குரு பலம் உண்டு (' + hj + '-ஆம் இடம்)', en: 'Jupiter is favourable (' + hj + 'th from your rasi)' } : { ta: 'குரு பலம் குறைவு (' + hj + '-ஆம் இடம்)', en: 'Jupiter is not in a favourable house (' + hj + 'th from your rasi)' }, gGood: gGood };
  }
  // ---------------- Rasi box ----------------
  var dlg = null;
  function rasiBox(i) {
    var r = cur, cb = C.chandraBala(i, r.moonRasi.i);
    var msg = {
      good: ['சந்திரன் உங்கள் ராசியிலிருந்து ' + cb.house + '-ஆம் இடத்தில் உள்ளார் — சாதகமான நிலை. நல்ல காரியங்களைத் தொடங்கலாம்.',
             'The moon is in the ' + cb.house + 'th house from your rasi, a favourable position. A good day to begin good work.'],
      avg:  ['சந்திரன் உங்கள் ராசியிலிருந்து ' + cb.house + '-ஆம் இடத்தில் உள்ளார் — சாதாரண நிலை. வழக்கமான வேலைகளை நிதானமாகச் செய்யுங்கள்.',
             'The moon is in the ' + cb.house + 'th house from your rasi, an average position. Do your usual work calmly.'],
      care: ['சந்திரன் 8-ஆம் இடத்தில் (சந்திராஷ்டமம்). பெரிய முடிவுகள், புதிய தொடக்கம், நீண்ட பயணம் ஆகியவற்றை நிதானமாக யோசித்துச் செய்யுங்கள். விநாயகரை வணங்குவது நல்லது.',
             'The moon is in the 8th house (Chandrashtama). Think twice before big decisions, new starts or long travel. Praying to Lord Ganesha is traditional.']
    }[cb.word];
    if (!dlg) {
      dlg = document.createElement('div'); dlg.className = 'soon-dim'; dlg.hidden = true;
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-x]')) dlg.hidden = true; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dlg.hidden = true; });
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = '<div class="soon-box" role="dialog" aria-modal="true"><p><span class="soon-badge pg-' + cb.word + '">' + ICON[cb.word] + ' ' + two(word[cb.word]) + '</span></p>' +
      '<h2>' + two([C.RASI_TA[i], C.RASI_EN[i]]) + '</h2><p>' + bi(msg[0], msg[1]) + '</p>' +
      (function () { var t = transit(i); return t ? '<div class="pg-tr"><p><b>' + bi('சனி பெயர்ச்சி', 'Saturn transit') + ':</b> ' + bi(t.sani.ta, t.sani.en) + '<br><small>' + bi('சனி இப்போது ', 'Saturn is now in ') + two([C.RASI_TA[t.saR], C.RASI_EN[t.saR]]) + '</small></p>' +
        '<p><b>' + bi('குரு பெயர்ச்சி', 'Jupiter transit') + ':</b> ' + bi(t.guru.ta, t.guru.en) + '<br><small>' + bi('குரு இப்போது ', 'Jupiter is now in ') + two([C.RASI_TA[t.juR], C.RASI_EN[t.juR]]) + '</small></p></div>' : ''; })() +
      '<p><small>' + bi('இன்று சந்திரன்: ', 'Moon today: ') + two([r.moonRasi.ta, r.moonRasi.en]) + ' · ' + tillTxt(r.moonRasi.until) + '</small></p>' +
      '<p><small>' + bi('இது தனிப்பட்ட ஜாதகப் பலன் அல்ல; சந்திரனின் நிலை மட்டும்.', 'This is the moon\'s position only, not a personal horoscope.') + '</small></p>' +
      '<div class="soon-act"><button type="button" class="btn" data-x>' + bi('மூடு', 'Close') + '</button></div></div>';
    dlg.hidden = false;
  }

  function wire() {
    ['pg-page', 'pg-rasi'].forEach(function (id) { var bx = document.getElementById(id); if (bx) hook(bx); });
  }
  function hook(box) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg]'), r = e.target.closest('[data-rasi]');
      if (b) { var n = +b.getAttribute('data-pg'); date = n === 0 ? todayIST() : add(date, n); page(); }
      if (r) rasiBox(+r.getAttribute('data-rasi'));
    });
    box.addEventListener('change', function (e) {
      if (e.target.classList.contains('pg-date') && e.target.value) { var p = e.target.value.split('-'); date = { y: +p[0], m: +p[1], d: +p[2] }; page(); }
      if (e.target.classList.contains('pg-city')) { city = +e.target.value; try { localStorage.setItem(KEY, city); } catch (x) { /* ok */ } page(); homeCard(); document.dispatchEvent(new Event('sa-city')); }
    });
  }

  load(); date = todayIST();
  // shared with js/calendar.js (month calendar tab)
  window.SAPanchangShared = { compute: compute, bi: bi, two: two, clock: clock, range: range, tillTxt: tillTxt, todayIST: todayIST,
    setDate: function (d) { date = d; page(); } };
  homeCard(); wire();
  function onHash() { var h = location.hash || ''; if (h === '' || h === '#home' || /^#(panchang|rasi)/.test(h)) { date = date || todayIST(); page(); } }
  window.addEventListener('hashchange', onHash); onHash();
})();
