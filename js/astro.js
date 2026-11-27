/* Sankalpam — Astrologer Consultation (customer side).
   Steps: 1 birth details -> 2 check chart -> 3 questions -> 4 review & send -> done.  "#astrology/my" = my readings.
   Shared helpers (kattam drawing, dasa text, reading view) are exposed as window.SAAstroUI for the admin page. */
(function () {
  'use strict';
  var A = window.SAAstro, DB = window.SADB;
  if (!A || !DB) return;

  var DRAFT = 'sa-astro-draft';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }
  function $(id) { return document.getElementById(id); }
  function two(n) { return n < 10 ? '0' + n : '' + n; }
  var WEEK_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  var WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MON_TA = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
  function monYear(J) { var d = A.jdToYmd(J); return { ta: MON_TA[d.m - 1] + ' ' + d.y, en: MON_EN[d.m - 1] + ' ' + d.y }; }

  /* ---------- chart drawing: South-Indian square kattam ---------- */
  var POS = { 11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3], 3: [1, 3], 4: [2, 3], 5: [3, 3], 6: [3, 2], 7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0] };
  function kattam(c, which, titleTa, titleEn) {
    var cells = {}, lg = which === 'nav' ? c.lagna.nav : c.lagna.rasi, r, k;
    A.BODY.forEach(function (b) {
      var pl = c.planets[b], rr = which === 'nav' ? pl.nav : pl.rasi;
      (cells[rr] = cells[rr] || []).push({ ta: A.BODY_SHORT_TA[b] + (pl.retro && b !== 'ra' && b !== 'ke' ? '(வ)' : ''), en: A.BODY_SHORT_EN[b] + (pl.retro && b !== 'ra' && b !== 'ke' ? '(R)' : '') });
    });
    var s = '<svg class="kt" viewBox="0 0 400 400" role="img" aria-label="Chart">';
    for (r = 0; r < 12; r++) {
      var p = POS[r], x = p[1] * 100, y = p[0] * 100;
      s += '<rect x="' + x + '" y="' + y + '" width="100" height="100" class="kt-c' + (r === lg ? ' kt-lg' : '') + '"/>';
      if (r === lg) s += '<path d="M' + x + ' ' + y + 'l26 0l-26 26z" class="kt-mark"/>';
    }
    s += '<text x="200" y="190" class="kt-title ta" text-anchor="middle">' + titleTa + '</text><text x="200" y="190" class="kt-title en" text-anchor="middle">' + titleEn + '</text>';
    for (r = 0; r < 12; r++) {
      var items = [], q = POS[r], cx = q[1] * 100 + 50, cy = q[0] * 100;
      if (r === lg) items.push({ ta: 'ல', en: 'Asc' });
      items = items.concat(cells[r] || []);
      ['ta', 'en'].forEach(function (lang) {
        var lines = [];
        for (k = 0; k < items.length; k += 2) lines.push(items.slice(k, k + 2).map(function (i) { return i[lang]; }).join(' '));
        s += '<text class="kt-t ' + lang + '" text-anchor="middle">' + lines.map(function (ln, i) {
          return '<tspan x="' + cx + '" y="' + (cy + 34 + i * 24) + '">' + esc(ln) + '</tspan>';
        }).join('') + '</text>';
      });
    }
    return s + '</svg>';
  }

  function lordName(l) { return bi(A.BODY_TA[l], A.BODY_EN[l]); }
  function dasaHtml(c) {
    var cur = c.current;
    if (!cur) return '';
    var a = monYear(cur.dasaFrom), b = monYear(cur.dasaTo), d = monYear(cur.bFrom), e = monYear(cur.bTo);
    return '<div class="as-row"><span class="as-l">' + bi('இப்போதைய தசை', 'Current dasa') + '</span><b>' + lordName(cur.dasa) + '</b> <small>' + bi(a.ta + ' – ' + b.ta, a.en + ' – ' + b.en) + '</small></div>' +
      '<div class="as-row"><span class="as-l">' + bi('புக்தி', 'Bhukti') + '</span><b>' + lordName(cur.bhukti) + '</b> <small>' + bi(d.ta + ' – ' + e.ta, d.en + ' – ' + e.en) + '</small></div>';
  }
  function chartFromInput(i) { return A.chart({ y: i.y, m: i.m, d: i.d, hh: i.hh, mi: i.mi, lat: i.lat, lon: i.lon, tz: i.tz }); }
  function basicText(c, lang, known) {
    var cur = c.current, ln = known === false ? null : c.lagna.rasi, t;
    if (lang === 'en') {
      t = (ln == null ? '' : 'Lagna: ' + A.RASI_EN[ln] + '. ') + 'Moon sign (Rasi): ' + A.RASI_EN[c.moonRasi] + '. Birth star: ' + A.NAK_EN[c.janmaNak] + ' (pada ' + c.janmaPada + ').';
      if (cur) t += ' Running dasa / bhukti: ' + A.BODY_EN[cur.dasa] + ' / ' + A.BODY_EN[cur.bhukti] + ' (' + monYear(cur.bFrom).en + ' – ' + monYear(cur.bTo).en + ').';
    } else {
      t = (ln == null ? '' : 'லக்னம்: ' + A.RASI_TA[ln] + '. ') + 'ராசி: ' + A.RASI_TA[c.moonRasi] + '. நட்சத்திரம்: ' + A.NAK_TA[c.janmaNak] + ' (பாதம் ' + c.janmaPada + ').';
      if (cur) t += ' நடப்பு தசை / புக்தி: ' + A.BODY_TA[cur.dasa] + ' / ' + A.BODY_TA[cur.bhukti] + ' (' + monYear(cur.bFrom).ta + ' – ' + monYear(cur.bTo).ta + ').';
    }
    return t;
  }
  function chartBlock(c, timeKnown) {
    var lagLine = timeKnown ? '<b>' + bi(A.RASI_TA[c.lagna.rasi], A.RASI_EN[c.lagna.rasi]) + '</b>' : '<b>—</b> <small>' + bi('பிறந்த நேரம் தெரியவில்லை', 'birth time not known') + '</small>';
    return '<div class="as-facts">' +
      '<div class="as-row"><span class="as-l">' + bi('பிறந்த கிழமை', 'Weekday') + '</span><b>' + bi(WEEK_TA[c.weekday], WEEK_EN[c.weekday]) + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('லக்னம்', 'Lagna') + '</span>' + lagLine + '</div>' +
      '<div class="as-row"><span class="as-l">' + bi('ராசி', 'Rasi') + '</span><b>' + bi(A.RASI_TA[c.moonRasi], A.RASI_EN[c.moonRasi]) + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('நட்சத்திரம்', 'Star') + '</span><b>' + bi(A.NAK_TA[c.janmaNak], A.NAK_EN[c.janmaNak]) + '</b> <small>' + bi('பாதம்', 'pada') + ' ' + c.janmaPada + '</small></div>' +
      dasaHtml(c) + '</div>';
  }
  function kattamPair(c) {
    return '<div class="as-kts"><div>' + kattam(c, 'rasi', 'ராசி', 'Rasi') + '</div><div>' + kattam(c, 'nav', 'நவாம்சம்', 'Navamsa') + '</div></div>';
  }

  /* ---------- the reading as the customer sees it (also used for the admin preview) ---------- */
  function readingHtml(item) {
    var r = item.reply || {}, p = item.payload || {}, lang = r.lang || p.lang || 'ta', c = null, i, out = '';
    try { c = chartFromInput(p.input); } catch (e) { c = null; }
    var tk = p.tob_known !== false;
    out += '<div class="as-read" data-reply-lang="' + lang + '">';
    out += '<h3>' + esc(p.name) + ' <small>' + esc(p.dob) + (tk ? ' · ' + esc(p.tob) : '') + ' · ' + esc(p.place_en || p.place) + '</small></h3>';
    if (c) out += chartBlock(c, tk) + kattamPair(c);
    if (r.basic) out += '<h4>' + bi('அடிப்படை விவரம்', 'Basic details') + '</h4><p class="as-txt">' + esc(r.basic) + '</p>';
    (r.answers || []).forEach(function (a) {
      out += '<div class="as-qa"><div class="as-q">' + esc(a.q) + '</div><div class="as-a">' + esc(a.a) + '</div></div>';
    });
    if (r.parihara) out += '<h4>' + bi('பரிகாரம் / வழிகாட்டுதல்', 'Pariharam / Guidance') + '</h4><p class="as-txt">' + esc(r.parihara) + '</p>';
    if (r.remarks) out += '<h4>' + bi('குறிப்பு', 'Note') + '</h4><p class="as-txt">' + esc(r.remarks) + '</p>';
    out += '<p class="as-disc">' + bi('இது ஜோதிட வழிகாட்டுதல் மட்டுமே; மருத்துவ, சட்ட அல்லது நிதி ஆலோசனை அல்ல. இறுதி முடிவு உங்களுடையது.',
      'This is astrological guidance only, not medical, legal or financial advice. The final decision is yours.') + '</p></div>';
    return out;
  }

  window.SAAstroUI = { esc: esc, bi: bi, kattam: kattam, kattamPair: kattamPair, chartBlock: chartBlock, dasaHtml: dasaHtml, chartFromInput: chartFromInput,
    basicText: basicText, readingHtml: readingHtml, monYear: monYear, WEEK_TA: WEEK_TA, WEEK_EN: WEEK_EN };

  var box = $('astro-box');
  if (!box) return;

  /* ---------- question templates ---------- */
  var TOPICS = [
    ['marriage', 'திருமணம்', 'Marriage', [
      ['எனக்கு எப்போது திருமணம் நடக்கும்?', 'When will my marriage happen?'],
      ['திருமணத்தில் தடை / தாமதத்திற்கு காரணம் என்ன? பரிகாரம் உண்டா?', 'What is causing delay in marriage? Any remedy?'],
      ['வாழ்க்கைத்துணை எந்த திசையிலிருந்து / எப்படிப்பட்டவர்?', 'What kind of life partner can I expect?']]],
    ['job', 'வேலை / தொழில்', 'Job & career', [
      ['எனக்கு எந்தத் துறை வேலை / தொழில் பொருத்தம்?', 'Which career field suits me?'],
      ['வேலை மாற்றம் அல்லது பதவி உயர்வு எப்போது?', 'When can I expect a job change or promotion?'],
      ['அரசு வேலை வாய்ப்பு உள்ளதா?', 'Is there a chance of a government job?']]],
    ['business', 'சொந்தத் தொழில்', 'Business', [
      ['சொந்தத் தொழில் தொடங்கலாமா? எப்போது நல்ல நேரம்?', 'Should I start a business? When is the right time?'],
      ['கூட்டுத் தொழில் எனக்கு சரியா?', 'Is a partnership good for me?']]],
    ['children', 'குழந்தை பாக்கியம்', 'Children', [
      ['குழந்தை பாக்கியம் எப்போது?', 'When can we expect children?'],
      ['குழந்தை தாமதத்திற்கு பரிகாரம் என்ன?', 'Any remedy for delay in having children?']]],
    ['education', 'கல்வி', 'Education', [
      ['எந்தப் படிப்பு எனக்கு ஏற்றது?', 'Which course of study suits me?'],
      ['உயர்கல்வி / போட்டித் தேர்வில் வெற்றி வாய்ப்பு?', 'Chances in higher studies / competitive exams?']]],
    ['health', 'ஆரோக்கியம்', 'Health', [
      ['என் ஜாதகப்படி கவனிக்க வேண்டிய ஆரோக்கியப் பகுதிகள் என்ன?', 'Which health areas should I take care of, as per my chart?']]],
    ['property', 'வீடு / நிலம்', 'House & property', [
      ['சொந்த வீடு / நிலம் வாங்க யோகம் எப்போது?', 'When is the right time to buy a house or land?'],
      ['வீடு கட்டத் தொடங்க ஏற்ற காலம்?', 'Best period to start building a house?']]],
    ['foreign', 'வெளிநாடு', 'Foreign travel / settlement', [
      ['வெளிநாடு செல்லும் யோகம் உள்ளதா? எப்போது?', 'Is there a yoga for going abroad? When?']]],
    ['money', 'பணம் / கடன்', 'Money & debts', [
      ['பணவரவு மற்றும் கடன் நிலை எப்போது சீராகும்?', 'When will my finances and debts improve?']]],
    ['dasa', 'தசா புக்தி பலன்', 'Dasa / Bhukti results', [
      ['நடப்பு தசா புக்தி எனக்கு எப்படி? அடுத்த 3 ஆண்டுகள் எப்படி?', 'How is my running dasa/bhukti? How will the next 3 years be?']]],
    ['parihara', 'பரிகாரம்', 'Remedies', [
      ['என் ஜாதகத்திற்கு ஏற்ற பரிகாரம் / வழிபாடு என்ன?', 'Which remedies / worship suit my chart?']]],
    ['family', 'குடும்பம்', 'Family & relationships', [
      ['குடும்ப அமைதி / உறவு சிக்கலுக்கு வழி என்ன?', 'How can I improve peace and relationships in the family?']]]
  ];

  /* ---------- state ---------- */
  var S = { step: 1, name: '', gender: '', dob: '', tob: '', tobKnown: true, placeText: '', lat: '', lon: '', tz: 'Asia/Kolkata', manual: false,
    verify: '', knownRasi: '', knownStar: '', topics: [], picked: [], own: '', lang: 'ta', consent: false };
  var info = { free_left: null, price: 199, paid_questions: 3, upi_id: '', upi_name: '' };
  var me = null, my = null, busy = false, result = null, view = 'wizard';

  function save() { try { localStorage.setItem(DRAFT, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); if (d && typeof d === 'object') Object.keys(S).forEach(function (k) { if (k in d) S[k] = d[k]; }); } catch (e) { /* ignore */ }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ } }
  load();

  function placeFind(text) {
    var t = String(text || '').trim().toLowerCase(), list = window.SAPlaces || [], i;
    if (!t) return null;
    for (i = 0; i < list.length; i++) if (t === (list[i][0] + ' / ' + list[i][1]).toLowerCase() || t === list[i][0].toLowerCase() || t === list[i][1].toLowerCase()) return list[i];
    return null;
  }

  var TZS = [['Asia/Kolkata', 'இந்தியா / India'], ['Asia/Colombo', 'இலங்கை / Sri Lanka'], ['Asia/Kathmandu', 'Nepal'], ['Asia/Dhaka', 'Bangladesh'], ['Asia/Singapore', 'சிங்கப்பூர் / Singapore'], ['Asia/Kuala_Lumpur', 'மலேசியா / Malaysia'], ['Asia/Bangkok', 'Thailand'], ['Asia/Jakarta', 'Indonesia'], ['Asia/Dubai', 'UAE / Oman'], ['Asia/Qatar', 'Qatar'], ['Asia/Kuwait', 'Kuwait'], ['Asia/Riyadh', 'Saudi Arabia'], ['Asia/Karachi', 'Pakistan'], ['Asia/Tokyo', 'Japan'], ['Asia/Hong_Kong', 'Hong Kong'], ['Europe/London', 'UK'], ['Europe/Paris', 'Europe (Central)'], ['Africa/Johannesburg', 'South Africa'], ['Indian/Mauritius', 'Mauritius'], ['America/New_York', 'USA / Canada East'], ['America/Chicago', 'USA Central'], ['America/Denver', 'USA Mountain'], ['America/Los_Angeles', 'USA West'], ['Australia/Sydney', 'Australia East'], ['Australia/Perth', 'Australia West'], ['Pacific/Auckland', 'New Zealand']];
  var CC_TZ = { in: 'Asia/Kolkata', lk: 'Asia/Colombo', np: 'Asia/Kathmandu', bd: 'Asia/Dhaka', sg: 'Asia/Singapore', my: 'Asia/Kuala_Lumpur', th: 'Asia/Bangkok', id: 'Asia/Jakarta', ae: 'Asia/Dubai', om: 'Asia/Dubai', qa: 'Asia/Qatar', kw: 'Asia/Kuwait', sa: 'Asia/Riyadh', pk: 'Asia/Karachi', jp: 'Asia/Tokyo', hk: 'Asia/Hong_Kong', gb: 'Europe/London', ie: 'Europe/London', fr: 'Europe/Paris', de: 'Europe/Paris', nl: 'Europe/Paris', ch: 'Europe/Paris', it: 'Europe/Paris', es: 'Europe/Paris', za: 'Africa/Johannesburg', mu: 'Indian/Mauritius', au: 'Australia/Sydney', nz: 'Pacific/Auckland' };
  function tzGuess(cc, lon) {
    cc = String(cc || '').toLowerCase();
    if (cc === 'us' || cc === 'ca') return lon > -87 ? 'America/New_York' : lon > -102 ? 'America/Chicago' : lon > -114 ? 'America/Denver' : 'America/Los_Angeles';
    if (cc === 'au' && lon < 130) return 'Australia/Perth';
    return CC_TZ[cc] || null;
  }
  function placeOptions() {
    var G = window.SAPlaceGroups || {}, list = window.SAPlaces || [], found = placeFind(S.placeText), out = '<option value="">— ' + bi('ஊரைத் தேர்வு செய்க', 'Select place') + ' —</option>';
    ['TN', 'PY', 'IN', 'INT'].forEach(function (g) {
      var rows = list.filter(function (p) { return (p[5] || 'IN') === g; });
      if (!rows.length) return;
      rows = rows.slice().sort(function (x, y) { return x[1].localeCompare(y[1]); });
      out += '<optgroup label="' + esc(G[g] || g) + '">' + rows.map(function (p) {
        var v = p[0] + ' / ' + p[1];
        return '<option value="' + esc(v) + '"' + (found === p ? ' selected' : '') + '>' + esc(p[1] + ' — ' + p[0]) + '</option>';
      }).join('') + '</optgroup>';
    });
    out += '<option value="__other"' + (S.placeText && !found ? ' selected' : '') + '>' + bi('பட்டியலில் இல்லை — தேடுக…', 'Not in the list — search…') + '</option>';
    return out;
  }
  function fmtLL(lat, lon) { return Math.abs(lat).toFixed(3) + '° ' + (lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(lon).toFixed(3) + '° ' + (lon >= 0 ? 'E' : 'W'); }
  function llText(p) { return p ? bi('அட்சரேகை / தீர்க்கரேகை: ', 'Latitude / Longitude: ') + fmtLL(p[2], p[3]) + ' · ' + esc(p[4]) : ''; }
  function placeSearch() {
    var q = (box.querySelector('input[name="psearch"]') || {}).value, ul = $('as-res');
    q = String(q || '').trim(); if (!ul) return; if (q.length < 2) { ul.innerHTML = ''; return; }
    ul.innerHTML = '<li class="as-note">…</li>';
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&accept-language=en&q=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!rows.length) { ul.innerHTML = '<li class="as-note">' + bi('கிடைக்கவில்லை. கீழே அட்சரேகை / தீர்க்கரேகை நேரடியாகத் தரலாம்.', 'Nothing found. You can type latitude / longitude below.') + '</li>'; return; }
        ul.innerHTML = rows.map(function (r, i) {
          return '<li><button type="button" class="as-pick" data-i="' + i + '" style="display:block;width:100%;text-align:left;padding:8px 10px;margin:4px 0;border:1px solid #d9b24a;border-radius:8px;background:#fff;cursor:pointer">' + esc(r.display_name) + '</button></li>';
        }).join('');
        ul._rows = rows;
      }).catch(function () { ul.innerHTML = '<li class="as-note">' + bi('தேடல் இப்போது இயங்கவில்லை. அட்சரேகை / தீர்க்கரேகையை நேரடியாகத் தரவும்.', 'Search is unavailable right now. Please type latitude / longitude below.') + '</li>'; });
  }
  function placePick(i) {
    var ul = $('as-res'), r = ul && ul._rows && ul._rows[i]; if (!r) return;
    var lat = parseFloat(r.lat), lon = parseFloat(r.lon), cc = r.address && r.address.country_code, tz = tzGuess(cc, lon) || S.tz;
    var nm = (r.display_name || '').split(',').slice(0, 2).join(',').trim();
    function set(n, v) { var e = box.querySelector('[name="' + n + '"]'); if (e) e.value = v; }
    set('pname', nm); set('lat', lat.toFixed(4)); set('lon', lon.toFixed(4)); set('tz', tz);
    S.placeText = nm; S.lat = lat.toFixed(4); S.lon = lon.toFixed(4); S.tz = tz; save();
    ul.innerHTML = '<li class="as-note">✓ ' + esc(nm) + ' — ' + fmtLL(lat, lon) + '</li>';
  }
  function placeChosen(v) {
    var m = $('as-manual'), ll = $('as-ll');
    function set(n, x) { var e = box.querySelector('[name="' + n + '"]'); if (e) e.value = x; }
    if (v === '__other') { S.placeText = (box.querySelector('input[name="pname"]') || {}).value || ''; if (m) m.hidden = false; if (ll) ll.hidden = true; save(); return; }
    S.placeText = v; var p = placeFind(v);
    if (m) m.hidden = true;
    if (ll) { ll.hidden = !p; ll.innerHTML = llText(p); }
    if (p) { S.lat = String(p[2]); S.lon = String(p[3]); S.tz = p[4]; set('lat', p[2]); set('lon', p[3]); set('tz', p[4]); }
    save();
  }
  function inputFromState() {
    var pl = placeFind(S.placeText), d = (S.dob || '').split('-'), t = (S.tobKnown && S.tob ? S.tob : '12:00').split(':');
    var lat = pl ? pl[2] : parseFloat(S.lat), lon = pl ? pl[3] : parseFloat(S.lon), tz = pl ? pl[4] : S.tz;
    if (d.length !== 3 || isNaN(lat) || isNaN(lon) || lat < -60 || lat > 70 || lon < -180 || lon > 180) return null;
    return { y: +d[0], m: +d[1], d: +d[2], hh: +t[0], mi: +t[1], lat: lat, lon: lon, tz: tz, place: pl };
  }
  function freeEligible() {
    if (info.free_left != null && info.free_left <= 0) return false;
    if (my && my.some(function (x) { return x.free; })) return false;
    return true;
  }
  function maxQ() { return freeEligible() ? 1 : info.paid_questions; }
  function allQuestions() {
    var list = S.picked.slice();
    if (S.own.trim()) list.push(S.own.trim());
    return list;
  }

  /* ---------- screens ---------- */
  function priceBanner() {
    var fe = freeEligible();
    return '<div class="as-price">' +
      '<span>' + bi('🎁 முதல் கேள்வி இலவசம்', '🎁 1st question FREE') + '</span>' +
      '<span>' + bi('அதன் பின் ஒரே கட்டணம் ₹' + info.price + ' (' + info.paid_questions + ' கேள்விகள் வரை)', 'Then one flat fee ₹' + info.price + ' (up to ' + info.paid_questions + ' questions)') + '</span>' +
      (fe ? '' : '<em>' + bi('உங்கள் இலவசக் கேள்வி பயன்படுத்தப்பட்டது / இலவச இடங்கள் நிறைந்தன', 'Free question already used / free slots full') + '</em>') + '</div>';
  }
  function head(step) {
    var names = [['விவரங்கள்', 'Details'], ['ஜாதகம் சரிபார்', 'Check chart'], ['கேள்விகள்', 'Questions'], ['சமர்ப்பி', 'Send']];
    return '<div class="as-steps">' + names.map(function (n, i) {
      return '<span class="' + (i + 1 === step ? 'is-on' : i + 1 < step ? 'is-done' : '') + '">' + (i + 1) + '. ' + bi(n[0], n[1]) + '</span>';
    }).join('') + '</div>';
  }
  function topNav() {
    return '<div class="as-tabs"><a href="#astrology" class="' + (view === 'wizard' ? 'is-on' : '') + '">' + bi('புதிய ஆலோசனை', 'New consultation') + '</a>' +
      '<a href="#astrology/my" class="' + (view === 'my' ? 'is-on' : '') + '">' + bi('என் பலன்கள்', 'My readings') + '</a></div>';
  }

  function step1() {
    var places = (window.SAPlaces || []).map(function (p) { return '<option value="' + esc(p[0] + ' / ' + p[1]) + '">'; }).join('');
    var found = placeFind(S.placeText);
    var showManual = S.placeText && !found;
    return '<h1>' + bi('ஜோதிடர் ஆலோசனை', 'Astrologer Consultation') + '</h1>' +
      '<p class="as-lead">' + bi('பிறந்த விவரங்களைத் தந்தால் உடனே ஜாதகம் கணிக்கப்படும். பிறகு உங்கள் கேள்விகளுக்கு ஜோதிடர் எழுத்து மூலம் பதில் தருவார்.',
        'Give your birth details and your chart is worked out instantly. Our astrologer then answers your questions in writing.') + '</p>' + priceBanner() +
      '<form id="as-f1" novalidate>' +
      '<label class="field"><span>' + bi('பெயர்', 'Name') + '</span><input name="name" type="text" maxlength="60" value="' + esc(S.name) + '" autocomplete="name"></label>' +
      '<label class="field"><span>' + bi('பாலினம்', 'Gender') + '</span><select name="gender"><option value="">—</option>' +
        ['M|ஆண்|Male', 'F|பெண்|Female'].map(function (g) { g = g.split('|'); return '<option value="' + g[0] + '"' + (S.gender === g[0] ? ' selected' : '') + '>' + g[1] + ' / ' + g[2] + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>' + bi('பிறந்த தேதி', 'Date of birth') + '</span><input name="dob" type="date" min="1900-01-01" max="' + new Date().toISOString().slice(0, 10) + '" value="' + esc(S.dob) + '"></label>' +
      '<label class="field"><span>' + bi('பிறந்த நேரம்', 'Time of birth') + '</span><input name="tob" type="time" value="' + esc(S.tob) + '"' + (S.tobKnown ? '' : ' disabled') + '></label>' +
      '<label class="as-chk"><input type="checkbox" name="tobUnknown"' + (S.tobKnown ? '' : ' checked') + '> ' + bi('சரியான பிறந்த நேரம் தெரியாது', "I don't know the exact birth time") + '</label>' +
      '<label class="field"><span>' + bi('பிறந்த ஊர்', 'Place of birth') + '</span><select name="place">' + placeOptions() + '</select></label>' +
      '<p class="as-note" id="as-ll"' + (found ? '' : ' hidden') + '>' + llText(found) + '</p>' +
      '<div class="as-manual" id="as-manual" ' + (showManual ? '' : 'hidden') + '><p class="as-note">' + bi('ஊர் பெயரைத் தேடுங்கள்; அட்சரேகை / தீர்க்கரேகை தானாக நிரப்பப்படும்.', 'Search the town — latitude / longitude fill in automatically.') + '</p>' +
        '<div style="display:flex;gap:8px"><input name="psearch" type="text" placeholder="Town, district, country" autocomplete="off" style="flex:1"><button type="button" class="btn" data-psearch>' + bi('தேடு', 'Search') + '</button></div>' +
        '<ul id="as-res" style="list-style:none;margin:8px 0;padding:0"></ul>' +
        '<label class="field"><span>' + bi('ஊர் பெயர்', 'Town name') + '</span><input name="pname" type="text" maxlength="80" value="' + esc(showManual ? S.placeText : '') + '"></label>' +
        '<label class="field"><span>' + bi('அட்சரேகை (Lat)', 'Latitude') + '</span><input name="lat" type="number" step="0.0001" value="' + esc(S.lat) + '"></label>' +
        '<label class="field"><span>' + bi('தீர்க்கரேகை (Long)', 'Longitude') + '</span><input name="lon" type="number" step="0.0001" value="' + esc(S.lon) + '"></label>' +
        '<label class="field"><span>' + bi('நாடு / நேர மண்டலம்', 'Country / time zone') + '</span><select name="tz">' +
        TZS.map(function (z) { return '<option value="' + z[0] + '"' + (S.tz === z[0] ? ' selected' : '') + '>' + z[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<p class="form-msg" id="as-m1" role="alert"></p>' +
      '<button type="submit" class="btn">' + bi('ஜாதகத்தைக் காட்டு →', 'Show my chart →') + '</button></form>' +
      '<p class="as-disc">' + bi('உங்கள் விவரங்கள் ஜோதிடருக்கு மட்டும் தெரியும்; வேறு யாருடனும் பகிரப்படாது.', 'Your details are seen only by the astrologer and are not shared.') + '</p>';
  }

  function step2() {
    var inp = inputFromState(), c;
    if (!inp) { S.step = 1; return step1(); }
    c = A.chart(inp);
    var warn = '';
    if (!S.tobKnown) warn = '<p class="as-warn">' + bi('பிறந்த நேரம் தெரியாததால் லக்னம் காட்டப்படவில்லை. ராசி, நட்சத்திரம் பெரும்பாலும் சரியாக இருக்கும். ஜோதிடர் தேவையான விளக்கம் தருவார்.',
      'Because the birth time is not known, lagna is not shown. Rasi and star are usually still right. The astrologer will guide you.') + '</p>';
    else if (c.uncertain) warn = '<p class="as-warn">' + bi('இந்த நேரம் ராசி / லக்ன எல்லையருகே உள்ளது; சில நிமிட வேறுபாடும் மாற்றும். ஜோதிடர் சரிபார்ப்பார்.', 'This time is near a sign or star boundary; a few minutes can change it. The astrologer will check.') + '</p>';
    var ver = ['yes|ஆம், சரியாக உள்ளது|Yes, it matches', 'no|இல்லை, வேறுபடுகிறது|No, it differs', 'unsure|தெரியவில்லை|I don\'t know'].map(function (o) {
      o = o.split('|'); return '<label class="as-opt"><input type="radio" name="verify" value="' + o[0] + '"' + (S.verify === o[0] ? ' checked' : '') + '> ' + bi(o[1], o[2]) + '</label>';
    }).join('');
    var rasiOpts = '<option value="">—</option>' + A.RASI_TA.map(function (n, i) { return '<option value="' + i + '"' + (String(S.knownRasi) === String(i) ? ' selected' : '') + '>' + n + ' / ' + A.RASI_EN[i] + '</option>'; }).join('');
    var starOpts = '<option value="">—</option>' + A.NAK_TA.map(function (n, i) { return '<option value="' + i + '"' + (String(S.knownStar) === String(i) ? ' selected' : '') + '>' + n + ' / ' + A.NAK_EN[i] + '</option>'; }).join('');
    return head(2) + '<h2>' + bi('உங்கள் ஜாதகம்', 'Your chart') + ' — ' + esc(S.name) + '</h2>' + chartBlock(c, S.tobKnown) +
      (S.tobKnown ? kattamPair(c) : '') + warn +
      '<h3>' + bi('இது உங்களுக்குத் தெரிந்த விவரங்களுடன் பொருந்துகிறதா?', 'Does this match what you already know?') + '</h3>' +
      '<p class="as-note">' + bi('கிழமை, லக்னம், ராசி, நட்சத்திரம் ஆகியவற்றை உங்கள் ஜாதகத்துடன் ஒப்பிடுங்கள்.', 'Compare the weekday, lagna, rasi and star with your own horoscope.') + '</p>' +
      '<div class="as-opts" id="as-ver">' + ver + '</div>' +
      '<div class="as-manual" id="as-known" ' + (S.verify === 'no' ? '' : 'hidden') + '><p class="as-note">' + bi('உங்கள் ஜாதகத்தில் உள்ளதைத் தேர்ந்தெடுக்கவும் (தெரிந்தால்). ஜோதிடர் நேரத்தைச் சரிசெய்து பார்ப்பார்.', 'Pick what your own horoscope says (if known). The astrologer will adjust the time and check.') + '</p>' +
        '<label class="field"><span>' + bi('உங்கள் ராசி', 'Your rasi') + '</span><select name="knownRasi">' + rasiOpts + '</select></label>' +
        '<label class="field"><span>' + bi('உங்கள் நட்சத்திரம்', 'Your star') + '</span><select name="knownStar">' + starOpts + '</select></label></div>' +
      '<p class="form-msg" id="as-m2" role="alert"></p>' +
      '<div class="as-nav"><button type="button" class="btn btn-outline" data-as="back">‹ ' + bi('திருத்து', 'Edit details') + '</button> <button type="button" class="btn" data-as="next2">' + bi('அடுத்து: கேள்விகள் →', 'Next: questions →') + '</button></div>';
  }

  function step3() {
    var mx = maxQ(), fe = freeEligible();
    var chips = TOPICS.map(function (t) { return '<button type="button" class="as-chip' + (S.topics.indexOf(t[0]) > -1 ? ' is-on' : '') + '" data-topic="' + t[0] + '">' + bi(t[1], t[2]) + '</button>'; }).join('');
    var qs = '';
    TOPICS.forEach(function (t) {
      if (S.topics.indexOf(t[0]) === -1) return;
      qs += '<div class="as-tq"><b>' + bi(t[1], t[2]) + '</b>' + t[3].map(function (q) {
        var txt = S.lang === 'en' ? q[1] : q[0];
        return '<label class="as-opt"><input type="checkbox" data-q="' + esc(txt) + '"' + (S.picked.indexOf(txt) > -1 ? ' checked' : '') + '> ' + bi(q[0], q[1]) + '</label>';
      }).join('') + '</div>';
    });
    return head(3) + '<h2>' + bi('உங்கள் கேள்விகள்', 'Your questions') + '</h2>' +
      '<p class="as-limit" id="as-limit">' + (fe ? bi('இலவசம்: 1 கேள்வி தேர்ந்தெடுக்கவும் (அல்லது சொந்தமாக எழுதவும்).', 'Free: choose 1 question (or write your own).') :
        bi('₹' + info.price + ' கட்டணத்தில் ' + mx + ' கேள்விகள் வரை.', 'Up to ' + mx + ' questions for the flat fee of ₹' + info.price + '.')) + '</p>' +
      '<p class="as-note">' + bi('தலைப்பைத் தொட்டு, தயார் கேள்விகளைத் தேர்ந்தெடுக்கவும்:', 'Tap a topic, then pick ready-made questions:') + '</p>' +
      '<div class="as-chips">' + chips + '</div>' + qs +
      '<label class="field"><span>' + bi('உங்கள் சொந்தக் கேள்வி (விருப்பம்)', 'Your own question (optional)') + '</span><textarea name="own" rows="3" maxlength="400">' + esc(S.own) + '</textarea></label>' +
      '<div class="field"><span>' + bi('பதில் எந்த மொழியில் வேண்டும்?', 'Reply language') + '</span><div class="as-opts">' +
        '<label class="as-opt"><input type="radio" name="lang" value="ta"' + (S.lang === 'ta' ? ' checked' : '') + '> தமிழ்</label><label class="as-opt"><input type="radio" name="lang" value="en"' + (S.lang === 'en' ? ' checked' : '') + '> English</label></div></div>' +
      '<p class="form-msg" id="as-m3" role="alert"></p>' +
      '<div class="as-nav"><button type="button" class="btn btn-outline" data-as="back">‹ ' + bi('பின்', 'Back') + '</button> <button type="button" class="btn" data-as="next3">' + bi('அடுத்து: சரிபார்த்து அனுப்பு →', 'Next: review & send →') + '</button></div>';
  }

  function step4() {
    var qs = allQuestions(), fe = freeEligible(), inp = inputFromState();
    return head(4) + '<h2>' + bi('சரிபார்த்து அனுப்புங்கள்', 'Review and send') + '</h2>' +
      '<div class="as-facts"><div class="as-row"><span class="as-l">' + bi('பெயர்', 'Name') + '</span><b>' + esc(S.name) + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('பிறந்த விவரம்', 'Birth') + '</span><b>' + esc(S.dob) + (S.tobKnown ? ' · ' + esc(S.tob) : ' · ' + (S.lang === 'en' ? 'time unknown' : 'நேரம் தெரியாது')) + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('ஊர்', 'Place') + '</span><b>' + esc(inp && inp.place ? inp.place[0] + ' / ' + inp.place[1] : S.placeText) + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('பதில் மொழி', 'Reply language') + '</span><b>' + (S.lang === 'en' ? 'English' : 'தமிழ்') + '</b></div></div>' +
      '<h3>' + bi('உங்கள் கேள்விகள்', 'Your questions') + '</h3><ol class="as-ql">' + qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
      '<div class="as-price"><span>' + (fe ? bi('இந்தக் கோரிக்கை இலவசம்', 'This request is FREE') : bi('கட்டணம்: ₹' + info.price + ' (UPI)', 'Fee: ₹' + info.price + ' (UPI)')) + '</span>' +
      '<span>' + bi('ஜோதிடர் தனிப்பட்ட முறையில் பார்த்து 48 மணி நேரத்திற்குள் இணையதளத்தில் பதில் தருவார்.', 'The astrologer reviews it personally and replies inside the website within 48 hours.') + '</span></div>' +
      '<label class="as-chk"><input type="checkbox" name="consent"' + (S.consent ? ' checked' : '') + '> ' + bi('என் விவரங்கள் ஜோதிடரால் பார்க்கப்படுவதற்கு ஒப்புக்கொள்கிறேன்; இது வழிகாட்டுதல் மட்டுமே என்பதை அறிவேன்.', 'I agree that the astrologer may see my details, and I understand this is guidance only.') + '</label>' +
      '<p class="form-msg" id="as-m4" role="alert"></p>' +
      '<div class="as-nav"><button type="button" class="btn btn-outline" data-as="back">‹ ' + bi('பின்', 'Back') + '</button> <button type="button" class="btn" data-as="send"' + (busy ? ' disabled' : '') + '>' + bi('சமர்ப்பி', 'Submit') + '</button></div>';
  }

  function payBlock(r) {
    var upi = info.upi_id, link = upi ? 'upi://pay?pa=' + encodeURIComponent(upi) + '&pn=' + encodeURIComponent(info.upi_name || 'Sankalpam') + '&am=' + r.amount + '&cu=INR&tn=' + encodeURIComponent('Astro ' + String(r.id).slice(0, 8)) : '';
    return '<div class="as-pay"><h3>' + bi('கட்டணம் ₹' + r.amount, 'Pay ₹' + r.amount) + '</h3>' +
      (upi ? '<p>UPI ID: <b id="as-upi">' + esc(upi) + '</b>' + (info.upi_name ? ' (' + esc(info.upi_name) + ')' : '') + '</p>' +
        '<p><a class="btn" href="' + esc(link) + '">' + bi('UPI ஆப்பில் செலுத்து', 'Pay in UPI app') + '</a></p>' :
        '<p class="as-warn">' + bi('UPI விவரம் விரைவில் சேர்க்கப்படும்.', 'UPI details will be added soon.') + '</p>') +
      '<form class="as-ref" data-id="' + esc(r.id) + '"><label class="field"><span>' + bi('பணம் செலுத்திய பின் UPI பரிவர்த்தனை எண் (UTR)', 'After paying, your UPI transaction number (UTR)') + '</span><input name="ref" type="text" maxlength="40" value="' + esc(r.pay_ref || '') + '"></label>' +
      '<button class="btn btn-outline" type="submit">' + bi('எண்ணை அனுப்பு', 'Send reference') + '</button> <span class="form-msg"></span></form>' +
      '<p class="as-note">' + bi('பணம் உறுதியானதும் ஜோதிடர் பதிலைத் தொடங்குவார்.', 'The astrologer starts once the payment is confirmed.') + '</p></div>';
  }

  function stepDone() {
    var r = result || {};
    return '<h1>' + bi('🙏 நன்றி!', '🙏 Thank you!') + '</h1>' +
      '<p class="as-lead">' + (r.free ? bi('உங்கள் இலவசக் கேள்வி பெறப்பட்டது. ஜோதிடர் பார்த்து 48 மணி நேரத்திற்குள் இணையதளத்தில் பதில் தருவார்.',
        'Your free question has been received. The astrologer will reply inside the website within 48 hours.') :
        bi('கோரிக்கை பெறப்பட்டது. கீழே கட்டணத்தைச் செலுத்தவும்.', 'Request received. Please pay below.')) + '</p>' +
      (r.free ? '' : payBlock(r)) +
      '<p><a class="btn" href="#astrology/my">' + bi('என் பலன்கள்', 'My readings') + '</a> <a class="btn btn-outline" href="#home">' + bi('முகப்பு', 'Home') + '</a></p>';
  }

  /* ---------- my readings ---------- */
  var STATUS = { awaiting_payment: ['கட்டணம் காத்திருக்கிறது', 'Waiting for payment'], 'new': ['ஜோதிடரிடம் உள்ளது', 'With astrologer'], in_review: ['பார்வையில் உள்ளது', 'Being reviewed'], answered: ['பதில் தயார்', 'Reading ready'] };
  function myView() {
    if (!me) return '<h1>' + bi('என் பலன்கள்', 'My readings') + '</h1><p>' + bi('பார்க்க உள்நுழையவும்.', 'Please log in to see your readings.') + '</p><p><a class="btn" href="#login" data-needlogin="1">' + bi('உள்நுழை', 'Log in') + '</a></p>';
    if (!my) return '<h1>' + bi('என் பலன்கள்', 'My readings') + '</h1><p>…</p>';
    if (!my.length) return '<h1>' + bi('என் பலன்கள்', 'My readings') + '</h1><p>' + bi('இன்னும் கோரிக்கை இல்லை.', 'No requests yet.') + '</p><p><a class="btn" href="#astrology">' + bi('ஆலோசனை பெறு', 'Start a consultation') + '</a></p>';
    return '<h1>' + bi('என் பலன்கள்', 'My readings') + '</h1>' + my.map(function (x) {
      var st = STATUS[x.status] || ['', ''], p = x.payload || {}, d = new Date(x.created_at), qs = (p.questions || []);
      return '<div class="as-item astro-item" data-id="' + esc(x.id) + '"><div class="as-item-h"><b>' + esc(p.name) + '</b> <small>' + two(d.getDate()) + '-' + two(d.getMonth() + 1) + '-' + d.getFullYear() + '</small> <span class="as-badge s-' + x.status + '">' + bi(st[0], st[1]) + '</span> ' + (x.free ? '<span class="as-badge">' + bi('இலவசம்', 'Free') + '</span>' : '<span class="as-badge">₹' + x.amount + '</span>') + '</div>' +
        '<ol class="as-ql">' + qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
        (x.status === 'awaiting_payment' ? payBlock({ id: x.id, amount: x.amount, pay_ref: x.pay_ref }) : '') +
        (x.status === 'answered' && x.reply ? '<div class="as-reading">' + readingHtml(x) + '<p class="astro-noprint"><button type="button" class="btn btn-outline" data-as="print" data-id="' + esc(x.id) + '">' + bi('PDF-ஆகச் சேமி / அச்சிடு', 'Save as PDF / Print') + '</button></p></div>' : '') + '</div>';
    }).join('');
  }

  /* ---------- render + events ---------- */
  function render() {
    var h = (location.hash || '').replace('#', '').split('/');
    view = h[1] === 'my' ? 'my' : 'wizard';
    var body = view === 'my' ? myView() : S.step === 1 ? step1() : S.step === 2 ? step2() : S.step === 3 ? step3() : S.step === 4 ? step4() : stepDone();
    box.innerHTML = topNav() + body;
  }
  function msg(id, t) { var e = $(id); if (e) { e.textContent = t; e.className = 'form-msg is-error'; } }
  function go(step) { S.step = step; save(); render(); window.scrollTo(0, 0); }

  function readStep1(f) {
    var d = new FormData(f);
    S.name = String(d.get('name') || '').trim(); S.gender = d.get('gender') || ''; S.dob = d.get('dob') || '';
    S.tobKnown = !d.get('tobUnknown'); S.tob = d.get('tob') || ''; var pv = String(d.get('place') || '').trim();
    if (d.get('lat') != null) { S.lat = d.get('lat'); S.lon = d.get('lon'); S.tz = d.get('tz') || S.tz; }
    if (pv === '__other') S.placeText = String(d.get('pname') || '').trim() || (S.lat && S.lon ? S.lat + ', ' + S.lon : '__other'); else S.placeText = pv;
    save();
  }
  function ensureLogin() {
    if (me) return true;
    try { localStorage.setItem('subham-asthu-return', '#astrology'); } catch (e) { /* ignore */ }
    save(); location.hash = '#login'; return false;
  }
  function refreshAll() {
    var t = DB.token();
    var pInfo = DB.rpc('sa_astro_info', {}).then(function (r) { if (r) info = r; }).catch(function () { /* defaults */ });
    var pMe = t ? DB.rpc('sa_me', { p_token: t }).then(function (u) { me = u || null; }).catch(function () { me = null; }) : Promise.resolve(me = null);
    return Promise.all([pInfo, pMe]).then(function () {
      if (!me) { my = null; return; }
      return DB.rpc('sa_astro_my', { p_token: t }).then(function (r) { my = r && r.ok ? r.items : []; }).catch(function () { my = []; });
    }).then(render);
  }

  box.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'as-f1') {
      e.preventDefault(); readStep1(f);
      if (S.name.length < 2) return msg('as-m1', 'பெயர் தேவை / Name needed');
      if (!S.dob) return msg('as-m1', 'பிறந்த தேதி தேவை / Date of birth needed');
      if (S.tobKnown && !S.tob) return msg('as-m1', 'பிறந்த நேரம் தரவும் அல்லது "தெரியாது" தேர்வு செய்யவும் / Give the time or tick "don\'t know"');
      if (!S.placeText || S.placeText === '__other') return msg('as-m1', 'பிறந்த ஊர் தேவை / Place of birth needed');
      if (!inputFromState()) { render(); return msg('as-m1', 'ஊர் பட்டியலில் இல்லை எனில் அட்சரேகை, தீர்க்கரேகை தரவும் / If the town is not listed, give latitude and longitude'); }
      go(2);
    } else if (f.classList.contains('as-ref')) {
      e.preventDefault();
      var out = f.querySelector('.form-msg'), ref = new FormData(f).get('ref');
      DB.rpc('sa_astro_pay_ref', { p_token: DB.token(), p_id: f.getAttribute('data-id'), p_ref: ref }).then(function (r) {
        out.className = 'form-msg ' + (r && r.ok ? 'is-ok' : 'is-error');
        out.textContent = r && r.ok ? 'பெறப்பட்டது / Received ✓' : 'சரியான எண்ணைத் தரவும் / Please enter a valid number';
      }).catch(function () { out.className = 'form-msg is-error'; out.textContent = 'பிழை / Error'; });
    }
  });

  box.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.name === 'psearch') { e.preventDefault(); placeSearch(); } });
  box.addEventListener('input', function (e) {
    var t = e.target;
    if (t.name === 'tobUnknown') { S.tobKnown = !t.checked; var tb = box.querySelector('input[name="tob"]'); if (tb) tb.disabled = t.checked; save(); }
    if (t.name === 'pname') { S.placeText = t.value.trim(); save(); }
    if (t.name === 'lat' || t.name === 'lon') { S[t.name] = t.value; save(); }
    if (t.name === 'own') { S.own = t.value; save(); }
  });
  box.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'place') return placeChosen(t.value);
    if (t.name === 'tz') { S.tz = t.value; save(); }
    if (t.name === 'verify') { S.verify = t.value; var k = $('as-known'); if (k) k.hidden = t.value !== 'no'; save(); }
    if (t.name === 'knownRasi') { S.knownRasi = t.value; save(); }
    if (t.name === 'knownStar') { S.knownStar = t.value; save(); }
    if (t.name === 'lang') { S.lang = t.value; save(); }
    if (t.name === 'consent') { S.consent = t.checked; save(); }
    if (t.hasAttribute && t.hasAttribute('data-q')) {
      var q = t.getAttribute('data-q'), i = S.picked.indexOf(q);
      if (t.checked) {
        var total = allQuestions().length;
        if (total >= maxQ()) { t.checked = false; var l = $('as-limit'); if (l) l.classList.add('is-warn'); return msg('as-m3', 'இனி தேர்வு செய்ய முடியாது (அதிகபட்சம் ' + maxQ() + ') / Limit reached (max ' + maxQ() + ')'); }
        S.picked.push(q);
      } else if (i > -1) S.picked.splice(i, 1);
      save();
    }
  });
  box.addEventListener('click', function (e) {
    var ps = e.target.closest('[data-psearch]'); if (ps) { e.preventDefault(); return placeSearch(); }
    var pk = e.target.closest('.as-pick'); if (pk) { e.preventDefault(); return placePick(+pk.getAttribute('data-i')); }
    var b = e.target.closest('[data-as],[data-topic]');
    if (!b) return;
    if (b.hasAttribute('data-topic')) {
      var tp = b.getAttribute('data-topic'), i = S.topics.indexOf(tp);
      if (i > -1) S.topics.splice(i, 1); else S.topics.push(tp);
      save(); render(); return;
    }
    var a = b.getAttribute('data-as');
    if (a === 'back') return go(Math.max(1, S.step - 1));
    if (a === 'next2') {
      if (!S.verify) return msg('as-m2', 'ஒரு தேர்வைத் தேர்ந்தெடுக்கவும் / Please choose one option');
      if (!ensureLogin()) return;
      return go(3);
    }
    if (a === 'next3') {
      var qs = allQuestions();
      if (!qs.length) return msg('as-m3', 'குறைந்தது ஒரு கேள்வி தேவை / At least one question is needed');
      if (qs.length > maxQ()) return msg('as-m3', 'அதிகபட்சம் ' + maxQ() + ' கேள்விகள் / Max ' + maxQ() + ' questions');
      return go(4);
    }
    if (a === 'print') {
      var card = b.closest('.astro-item');
      document.body.classList.add('astro-printing'); card.classList.add('is-printing');
      window.print();
      setTimeout(function () { document.body.classList.remove('astro-printing'); card.classList.remove('is-printing'); }, 500);
      return;
    }
    if (a === 'send') {
      if (busy) return;
      if (!S.consent) return msg('as-m4', 'ஒப்புதல் தேவை / Please tick the agreement');
      if (!ensureLogin()) return;
      var inp = inputFromState(), c = A.chart(inp), pl = inp.place;
      busy = true; b.disabled = true;
      var payload = {
        name: S.name, gender: S.gender, dob: S.dob, tob: S.tobKnown ? S.tob : '', tob_known: S.tobKnown,
        place: pl ? pl[0] : S.placeText, place_en: pl ? pl[1] : S.placeText,
        input: { y: inp.y, m: inp.m, d: inp.d, hh: inp.hh, mi: inp.mi, lat: inp.lat, lon: inp.lon, tz: inp.tz },
        summary: { lagna: S.tobKnown ? c.lagna.rasi : null, rasi: c.moonRasi, star: c.janmaNak, pada: c.janmaPada, weekday: c.weekday,
          dasa: c.current ? c.current.dasa : null, bhukti: c.current ? c.current.bhukti : null },
        verify: S.verify, known_rasi: S.knownRasi, known_star: S.knownStar,
        topics: S.topics, questions: allQuestions(), lang: S.lang, consent: true
      };
      DB.rpc('sa_astro_submit', { p_token: DB.token(), p_payload: payload }).then(function (r) {
        busy = false;
        if (r && r.ok) { result = { id: r.id, free: r.free, amount: r.amount }; clearDraft(); S.step = 5; S.picked = []; S.topics = []; S.own = ''; S.consent = false; S.verify = ''; return refreshAll(); }
        var errs = { login: 'மீண்டும் உள்நுழையவும் / Please log in again', too_many: 'இன்று அதிக கோரிக்கைகள்; நாளை முயற்சிக்கவும் / Too many requests today', free_one_question: 'இலவசமாக 1 கேள்வி மட்டும் / Free reading allows 1 question',
          max_questions: 'அதிகபட்ச கேள்விகளைத் தாண்டிவிட்டது / Too many questions', consent: 'ஒப்புதல் தேவை / Agreement needed' };
        render(); msg('as-m4', errs[r && r.error] || 'சமர்ப்பிக்க முடியவில்லை, மீண்டும் முயற்சிக்கவும் / Could not submit, please try again');
      }).catch(function () { busy = false; render(); msg('as-m4', 'இணைப்புப் பிழை / Connection problem — please try again'); });
    }
  });
  box.addEventListener('click', function (e) {
    if (e.target.closest('[data-needlogin]')) { try { localStorage.setItem('subham-asthu-return', '#astrology/my'); } catch (x) { /* ignore */ } }
  });

  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#astrology') === 0) { if (S.step === 5 && location.hash === '#astrology') { S.step = 1; } refreshAll(); } });
  if ((location.hash || '').indexOf('#astrology') === 0) refreshAll(); else render();
  document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(function () { if (S.step === 3) { /* template text language changes on next render */ } }, 0); }); });
})();
