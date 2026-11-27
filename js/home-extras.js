/* Sankalpam — home page extras: next-festival banner, coming-festivals cards, install-app bar.
   Uses the same pooja calendar the Poojas page uses (sa_pooja_dates) and the visible-pooja list.
   If the database cannot be reached, these blocks simply stay hidden. */
(function () {
  'use strict';

  var DB = window.SADB;
  var P = window.SAPoojas;
  if (!DB || !P) return;

  var TA_MON = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
  var EN_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }

  // Today's date in India, as YYYY-MM-DD.
  function todayIST() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }
  function dayNumber(ymd) {
    var p = ymd.split('-');
    return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  function whenHtml(ymd, today) {
    var p = ymd.split('-'), m = +p[1] - 1, d = +p[2];
    var n = dayNumber(ymd) - dayNumber(today);
    var away = n <= 0 ? bi('இன்று', 'Today') : n === 1 ? bi('நாளை', 'Tomorrow') : bi(n + ' நாட்களில்', 'in ' + n + ' days');
    return bi(d + ' ' + TA_MON[m], d + ' ' + EN_MON[m]) + ' · ' + away;
  }

  function renderFestivals(dates, visible) {
    var by = {};
    visible.forEach(function (r) { by[r.slug] = r; });
    var today = todayIST();
    var seen = {}, list = [];
    // Next occurrence of each pooja, soonest first.
    dates.forEach(function (x) {
      if (x.date < today || !by[x.slug] || seen[x.slug]) return;
      seen[x.slug] = true;
      list.push(x);
    });
    list.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    if (!list.length) return;

    var first = list[0], r0 = by[first.slug];
    var banner = document.getElementById('fest-banner');
    if (banner) {
      document.getElementById('fest-name').innerHTML = bi(esc(r0.name_ta), esc(r0.name_en));
      document.getElementById('fest-when').innerHTML = whenHtml(first.date, today);
      document.getElementById('fest-open').setAttribute('href', '#poojas/' + encodeURIComponent(r0.slug));
      banner.hidden = false;
    }

    var strip = document.getElementById('fest-strip');
    var cards = document.getElementById('fest-cards');
    if (strip && cards) {
      cards.innerHTML = list.slice(0, 4).map(function (x) {
        var r = by[x.slug];
        return '<a class="fest-card" href="#poojas/' + encodeURIComponent(r.slug) + '">' +
          '<strong>' + bi(esc(r.name_ta), esc(r.name_en)) + '</strong>' +
          '<span class="fest-date">' + whenHtml(x.date, today) + '</span>' +
          ((x.note_ta || x.note_en) ? '<small>' + bi(esc(x.note_ta || x.note_en), esc(x.note_en || x.note_ta)) + '</small>' : '') +
          '</a>';
      }).join('');
      strip.hidden = false;
    }
  }

  function loadFestivals() {
    var datesP = DB.rpc('sa_pooja_dates', {}).then(function (r) { return Array.isArray(r) ? r : []; }).catch(function () { return []; });
    Promise.all([datesP, P.seed()]).then(function (res) {
      if (res[0].length && res[1].length) renderFestivals(res[0], res[1]);
    });
  }

  // ---------- Install-app bar (shown only where the browser offers to install the app) ----------
  var DISMISS_KEY = 'subham-asthu-install-dismissed';
  function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    if (stored(DISMISS_KEY)) return;
    deferred = e;
    showInstallBar();
  });
  window.addEventListener('appinstalled', function () { removeInstallBar(); });

  function removeInstallBar() {
    var el = document.getElementById('install-bar');
    if (el) el.remove();
    document.body.classList.remove('has-install-bar');
  }
  function showInstallBar() {
    if (document.getElementById('install-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'install-bar';
    bar.className = 'install-bar';
    bar.innerHTML = '<span class="ib-text">' + bi('சங்கல்பம் ஆப்பை உங்கள் போனில் சேர்க்கவும்', 'Add the Sankalpam app to your phone') + '</span>' +
      '<button type="button" class="btn" data-ib-install>' + bi('ஆப் பெறுக', 'Get App') + '</button>' +
      '<button type="button" class="ib-close" data-ib-close aria-label="Close">×</button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-install-bar');
    bar.addEventListener('click', function (e) {
      if (e.target.closest('[data-ib-close]')) { store(DISMISS_KEY, '1'); removeInstallBar(); return; }
      if (e.target.closest('[data-ib-install]') && deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; removeInstallBar(); });
      }
    });
  }

  loadFestivals();
})();
