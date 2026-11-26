/* Subham Astu — month calendar (tab inside the Panchang page).
   Vrathams (Ekadashi, Pradosham, Sankatahara, Sashti, Krithigai, Amavasya, Pournami) are calculated on the phone with the
   panchang engine; festival dates come from the pooja calendar in the database (sa_pooja_dates) and override the
   calculated ones. Tap a date to see that day's panchang and poojas. */
(function () {
  'use strict';
  var C = window.SAPanchangCore, S = window.SAPanchangShared, DB = window.SADB, PJ = window.SAPoojas;
  var box = document.getElementById('pg-cal');
  if (!C || !S || !box) return;
  var T = C._t, bi = S.bi, two = S.two;

  var MON_TA = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
  var MON_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WD_TA = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'], WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // grp: fe = festival, vr = vratham, mo = amavasya / pournami
  var TYPES = {
    fe: { ta: 'பண்டிகை', en: 'Festival', ch: ['★', '★'], grp: 'fe' },
    ek: { slug: 'ekadashi', ta: 'ஏகாதசி', en: 'Ekadashi', ch: ['ஏ', 'E'], grp: 'vr' },
    pr: { slug: 'pradosham', ta: 'பிரதோஷம்', en: 'Pradosham', ch: ['பி', 'P'], grp: 'vr' },
    sk: { slug: 'sankatahara-chaturthi', ta: 'சங்கடஹர சதுர்த்தி', en: 'Sankatahara Chaturthi', ch: ['ச', 'S'], grp: 'vr' },
    sa: { slug: 'masa-sashti', ta: 'சஷ்டி', en: 'Sashti', ch: ['ஷ', 'Sh'], grp: 'vr' },
    kr: { slug: 'krithigai', ta: 'கிருத்திகை', en: 'Krithigai', ch: ['கி', 'K'], grp: 'vr' },
    am: { slug: 'amavasya-pitru', ta: 'அமாவாசை', en: 'Amavasya', ch: ['●', '●'], grp: 'mo' },
    po: { slug: 'pournami-satyanarayana', ta: 'பௌர்ணமி', en: 'Pournami', ch: ['○', '○'], grp: 'mo' }
  };
  var SLUG_TYPE = {};
  Object.keys(TYPES).forEach(function (k) { if (TYPES[k].slug) SLUG_TYPE[TYPES[k].slug] = k; });
  SLUG_TYPE['skanda-sashti'] = 'fe'; // yearly Skanda Sashti is a festival, not the monthly vratham

  var now = S.todayIST(), view = { y: now.y, m: now.m }, filter = 'all', sel = null;
  var cache = {}, dbRows = null, dbAt = 0, names = {};

  function two0(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.y + '-' + two0(d.m) + '-' + two0(d.d); }
  function parse(s) { var p = s.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function addD(d, n) { var t = new Date(Date.UTC(d.y, d.m - 1, d.d) + n * 86400000); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function dow(d) { return new Date(Date.UTC(d.y, d.m - 1, d.d)).getUTCDay(); }
  function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  (PJ && PJ.CATALOG || []).forEach(function (r) { names[r.slug] = [r.name_ta, r.name_en]; });

  // ---------- calculation ----------
  function jdAt(d, min) { return T.jd(d.y, d.m, d.d, 0) + (min - 330) / 1440; }
  function tithiAt(d, min) { return Math.floor(T.elong(jdAt(d, min)) / 12) + 1; }
  function nakAt(d, min) { var J = jdAt(d, min); return Math.floor(T.sid(T.moonLon(J), J) / (360 / 27)); }
  function dayInfo(d) {
    var ck = ''; try { ck = localStorage.getItem('subham-asthu-city'); } catch (e) { /* default city */ }
    var k = iso(d) + '|' + ck;
    if (cache[k]) return cache[k];
    var r = S.compute(d, 720), m = {
      ek: [11, 26].indexOf(r.tithi.n) !== -1,
      pr: [13, 28].indexOf(tithiAt(d, r.sunset + 45)) !== -1,
      sk: tithiAt(d, 1200) === 19,
      sa: [6, 21].indexOf(tithiAt(d, 720)) !== -1,
      kr: nakAt(d, 720) === 2,
      am: tithiAt(d, 870) === 30,
      po: tithiAt(d, 1080) === 15
    };
    return (cache[k] = { r: r, m: m });
  }
  function autoEvents(y, mo) {
    var out = {}, n = dim(y, mo);
    for (var i = 1; i <= n; i++) {
      var d = { y: y, m: mo, d: i }, cur = dayInfo(d), prev = dayInfo(addD(d, -1)), list = [];
      Object.keys(cur.m).forEach(function (t) {
        if (cur.m[t] && !prev.m[t]) list.push({ type: t, slug: TYPES[t].slug, src: 'auto' });
      });
      out[iso(d)] = list;
    }
    return out;
  }

  // ---------- database dates ----------
  function loadDb() {
    if (dbRows && Date.now() - dbAt < 600000) return Promise.resolve(dbRows);
    if (!DB || !PJ) return Promise.resolve([]);
    return Promise.all([
      DB.rpc('sa_pooja_dates', {}).then(function (r) { return Array.isArray(r) ? r : []; }).catch(function () { return []; }),
      PJ.seed().catch(function () { return []; })
    ]).then(function (res) {
      var ok = {}; res[1].forEach(function (p) { ok[p.slug] = true; });
      dbRows = res[0].filter(function (x) { return ok[x.slug]; }); dbAt = Date.now();
      return dbRows;
    });
  }
  function eventsFor(y, mo) {
    var ev = autoEvents(y, mo), first = iso({ y: y, m: mo, d: 1 }), last = iso({ y: y, m: mo, d: dim(y, mo) });
    (dbRows || []).forEach(function (x) {
      if (x.date < first || x.date > last) return;
      var t = SLUG_TYPE[x.slug] || 'fe';
      var near = [x.date, iso(addD(parse(x.date), -1)), iso(addD(parse(x.date), 1))];
      near.forEach(function (dd) {            // the database date wins over the calculated one for the same pooja
        if (ev[dd]) ev[dd] = ev[dd].filter(function (e) { return !(e.src === 'auto' && e.type === t && t !== 'fe'); });
      });
      ev[x.date] = ev[x.date] || [];
      if (!ev[x.date].some(function (e) { return e.slug === x.slug; })) ev[x.date].push({ type: t, slug: x.slug, src: 'db', note: [x.note_ta, x.note_en] });
    });
    return ev;
  }
  function evName(e) { var n = names[e.slug]; return n ? n : [TYPES[e.type].ta, TYPES[e.type].en]; }
  function show(e) { return filter === 'all' || TYPES[e.type].grp === filter; }

  // ---------- drawing ----------
  function chip(t) { var c = TYPES[t].ch; return '<u class="cc cc-' + t + '" aria-hidden="true">' + bi(c[0], c[1]) + '</u>'; }
  function render() {
    var y = view.y, mo = view.m, ev = eventsFor(y, mo), n = dim(y, mo), lead = dow({ y: y, m: mo, d: 1 });
    var cells = '', list = '', today = iso(now), tm = {}, k;
    for (k = 0; k < 7; k++) cells += '<div class="cal-wd">' + bi(WD_TA[k], WD_EN[k]) + '</div>';
    for (k = 0; k < lead; k++) cells += '<span class="cal-e"></span>';
    for (k = 1; k <= n; k++) {
      var d = { y: y, m: mo, d: k }, key = iso(d), inf = dayInfo(d), es = (ev[key] || []).filter(show);
      tm[inf.r.tamil.month[0]] = inf.r.tamil.month;
      var types = [], seen = {};
      es.forEach(function (e) { if (!seen[e.type]) { seen[e.type] = 1; types.push(e.type); } });
      var chips = types.slice(0, 2).map(chip).join('') + (types.length > 2 ? '<u class="cc cc-more">+' + (types.length - 2) + '</u>' : '');
      var label = DAY_EN[dow(d)] + ' ' + k + ' ' + MON_EN[mo - 1] + (es.length ? ': ' + es.map(function (e) { return evName(e)[1]; }).join(', ') : '');
      cells += '<button type="button" class="cal-d' + (key === today ? ' cal-today' : '') + (es.length ? ' cal-has' : '') + (types.indexOf('fe') !== -1 ? ' cal-fest' : '') +
        (inf.r.tamil.day === 1 ? ' cal-m1' : '') + '" data-d="' + key + '" aria-label="' + esc(label) + '"><b>' + k + '</b><i class="cal-t">' + inf.r.tamil.day + '</i><span class="cal-m">' + chips + '</span></button>';
      es.forEach(function (e) {
        var nm = evName(e);
        list += '<button type="button" class="cal-li" data-d="' + key + '"><span class="cal-ld"><b>' + k + '</b><small>' + bi(WD_TA[dow(d)], WD_EN[dow(d)]) + '</small></span>' +
          chip(e.type) + '<span class="cal-ln">' + bi(esc(nm[0]), esc(nm[1])) + '</span></button>';
      });
    }
    var mons = Object.keys(tm).map(function (x) { return two(tm[x]); }).join(' – ');
    var chips2 = [['all', 'அனைத்தும்', 'All'], ['fe', 'பண்டிகை', 'Festivals'], ['vr', 'விரதங்கள்', 'Vrathams'], ['mo', 'அமாவாசை / பௌர்ணமி', 'Amavasya / Pournami']].map(function (c) {
      return '<button type="button" class="ad-chip' + (filter === c[0] ? ' is-on' : '') + '" data-f="' + c[0] + '">' + bi(c[1], c[2]) + '</button>';
    }).join('');
    var legend = ['fe', 'ek', 'pr', 'sk', 'sa', 'kr', 'am', 'po'].map(function (t) {
      return '<span class="cal-lg">' + chip(t) + ' ' + bi(TYPES[t].ta, TYPES[t].en) + '</span>';
    }).join('');
    box.innerHTML = '<div class="cal-wrap"><div class="cal-bar">' +
      '<button type="button" class="btn btn-outline" data-nav="-1" aria-label="Previous month">‹</button>' +
      '<div class="cal-title"><strong>' + bi(MON_TA[mo - 1] + ' ' + y, MON_EN[mo - 1] + ' ' + y) + '</strong><small>' + mons + '</small></div>' +
      '<button type="button" class="btn btn-outline" data-nav="1" aria-label="Next month">›</button>' +
      '<button type="button" class="btn btn-gold cal-today-btn" data-nav="0">' + bi('இன்று', 'Today') + '</button></div>' +
      '<div class="cal-chips">' + chips2 + '</div>' +
      '<div class="cal-grid" role="group">' + cells + '</div>' +
      '<div class="cal-legend">' + legend + '</div>' +
      '<h2 class="pg-h">' + bi('இந்த மாத சிறப்பு நாட்கள்', "This month's special days") + '</h2>' +
      '<div class="cal-list">' + (list || '<p>' + bi('இந்த மாதம் எதுவும் இல்லை.', 'Nothing this month.') + '</p>') + '</div>' +
      '<p class="pg-foot">' + bi('தேதிகள் கணக்கிடப்பட்டவை; சில பஞ்சாங்கங்களில் ஒரு நாள் வேறுபடலாம். விரத / பூஜை நாளை உங்கள் குடும்ப பஞ்சாங்கத்துடன் உறுதி செய்யவும்.',
        'Dates are calculated and may differ by a day in some almanacs. Please confirm vratham and pooja days with your family panchangam.') + '</p></div>';
  }

  // ---------- day sheet ----------
  var dlg = null;
  function openDay(key) {
    var d = parse(key), inf = dayInfo(d), r = inf.r, es = (eventsFor(d.y, d.m)[key] || []);
    if (!dlg) {
      dlg = document.createElement('div'); dlg.className = 'soon-dim cal-sheet'; dlg.hidden = true;
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg || e.target.closest('[data-x]')) dlg.hidden = true;
        var g = e.target.closest('[data-full]'); if (g) { dlg.hidden = true; S.setDate(parse(g.getAttribute('data-full'))); location.hash = '#panchang'; }
        if (e.target.closest('a[href]')) dlg.hidden = true;
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dlg.hidden = true; });
      document.body.appendChild(dlg);
    }
    var evh = es.length ? es.map(function (e) {
      var nm = evName(e), note = e.note && (e.note[0] || e.note[1]) ? '<small>' + bi(esc(e.note[0] || e.note[1]), esc(e.note[1] || e.note[0])) + '</small>' : '';
      return '<div class="cal-ev">' + chip(e.type) + '<div><strong>' + bi(esc(nm[0]), esc(nm[1])) + '</strong>' + note + '</div>' +
        '<div class="cal-evb"><a class="btn btn-outline" href="#poojas/' + encodeURIComponent(e.slug) + '">' + bi('பூஜை விவரம்', 'Pooja details') + '</a>' +
        '<a class="btn btn-gold" href="#downloads">' + bi('வழிகாட்டி PDF', 'Guide PDF') + '</a></div></div>';
    }).join('') : '<p class="cal-none">' + bi('இன்று சிறப்பு விரதம் / பண்டிகை இல்லை.', 'No special vratham or festival on this day.') + '</p>';
    dlg.innerHTML = '<div class="soon-box cal-box" role="dialog" aria-modal="true">' +
      '<h2>' + bi(DAY_TA[dow(d)] + ', ' + d.d + ' ' + MON_TA[d.m - 1], DAY_EN[dow(d)] + ', ' + d.d + ' ' + MON_EN[d.m - 1] + ' ' + d.y) + '</h2>' +
      '<p class="cal-tamil">' + two(r.tamil.month) + ' ' + r.tamil.day + (r.tamil.day === 1 ? ' · <b>' + bi('மாதப் பிறப்பு', 'Month begins') + '</b>' : '') + '</p>' +
      evh +
      '<div class="pg-mini cal-mini">' +
      '<div><small>' + bi('திதி', 'Tithi') + '</small><b>' + two(r.tithi.name) + '</b><em>' + two(r.tithi.paksha) + '</em></div>' +
      '<div><small>' + bi('நட்சத்திரம்', 'Nakshatra') + '</small><b>' + two(r.nakshatra.name) + '</b></div>' +
      '<div><small>' + bi('ராகு காலம்', 'Rahu Kalam') + '</small><b>' + S.range(r.rahu) + '</b></div>' +
      '<div><small>' + bi('சூரிய உதயம்', 'Sunrise') + '</small><b>' + S.clock(r.sunrise) + '</b></div></div>' +
      '<div class="soon-act"><button type="button" class="btn btn-outline" data-full="' + key + '">' + bi('இந்த நாளின் முழு பஞ்சாங்கம் ›', 'Full panchang for this day ›') + '</button>' +
      '<button type="button" class="btn" data-x>' + bi('மூடு', 'Close') + '</button></div></div>';
    dlg.hidden = false;
  }

  // ---------- wiring ----------
  box.addEventListener('click', function (e) {
    var nv = e.target.closest('[data-nav]'), f = e.target.closest('[data-f]'), d = e.target.closest('[data-d]');
    if (nv) {
      var s = +nv.getAttribute('data-nav');
      if (s === 0) view = { y: now.y, m: now.m }; else { var t = view.m + s; view = { y: view.y + (t < 1 ? -1 : t > 12 ? 1 : 0), m: t < 1 ? 12 : t > 12 ? 1 : t }; }
      render();
    } else if (f) { filter = f.getAttribute('data-f'); render(); }
    else if (d) openDay(d.getAttribute('data-d'));
  });
  document.addEventListener('sa-city', function () { cache = {}; if (!box.hidden) render(); });

  function route() {
    var h = (location.hash || '').slice(1).split('/');
    if (h[0] !== 'panchang') return;
    var on = h[1] === 'calendar', pg = document.getElementById('pg-page');
    box.hidden = !on; if (pg) pg.hidden = on;
    document.querySelectorAll('[data-pgtab]').forEach(function (a) {
      var is = (a.getAttribute('data-pgtab') === 'cal') === on;
      if (is) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (on) { now = S.todayIST(); render(); loadDb().then(function () { if (!box.hidden) render(); }); }
  }
  window.addEventListener('hashchange', route);
  route();
})();
