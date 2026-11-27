/* Sankalpam — slow running-text bar under the header.
   Shows today's panchang points, the next festival and announcements. Tap or hover to pause; there is also a pause button.
   Edit the NOTES list below to add your own announcements. */
(function () {
  'use strict';
  var C = window.SAPanchangCore, bar = document.getElementById('sa-ticker');
  if (!C || !bar) return;
  var NOTES = [
    ['🪔 பூஜை வழிகாட்டிகள் (PDF) இலவசப் பதிவுடன் பதிவிறக்கலாம்', '🪔 Pooja guides (PDF) can be downloaded after a free registration'],
    ['🙏 வாத்தியார், சமையல், பூஜைப் பொருட்கள், ஜோதிடர் சேவைகள் விரைவில்', '🙏 Purohit, cook, pooja-items and astrologer services coming soon']
  ];
  var CITY = { lat: 13.0827, lon: 80.2707 };
  function t2(a) { return '<span class="ta">' + a[0] + '</span><span class="en">' + a[1] + '</span>'; }
  function clk(min) { min = Math.round(min); var m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60); return ((h % 12) || 12) + ':' + String(m % 60).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }
  function build() {
    var p = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-'), d = { y: +p[0], m: +p[1], d: +p[2] };
    var r = C.calc(d, CITY, 720), items = [];
    items.push(['📅 ' + r.tamil.month[0] + ' ' + r.tamil.day + ' · ' + r.tamil.day_name[0], '📅 ' + r.tamil.month[1] + ' ' + r.tamil.day + ' · ' + r.tamil.day_name[1]]);
    items.push(['திதி: ' + r.tithi.name[0] + ' (' + clk(r.tithi.end) + ' வரை)', 'Tithi: ' + r.tithi.name[1] + ' (until ' + clk(r.tithi.end) + ')']);
    items.push(['நட்சத்திரம்: ' + r.nakshatra.name[0] + ' (' + clk(r.nakshatra.end) + ' வரை)', 'Nakshatra: ' + r.nakshatra.name[1] + ' (until ' + clk(r.nakshatra.end) + ')']);
    items.push(['ராகு காலம்: ' + clk(r.rahu[0]) + ' – ' + clk(r.rahu[1]), 'Rahu Kalam: ' + clk(r.rahu[0]) + ' – ' + clk(r.rahu[1])]);
    var f = document.getElementById('fest-name'), w = document.getElementById('fest-when');
    if (f && w && f.textContent) items.push(['அடுத்த விசேஷம்: ' + (f.querySelector('.ta') || f).textContent + ' — ' + (w.querySelector('.ta') || w).textContent,
      'Next special day: ' + (f.querySelector('.en') || f).textContent + ' — ' + (w.querySelector('.en') || w).textContent]);
    items = items.concat(NOTES);
    var line = items.map(function (a) { return '<span class="tk-i">' + t2(a) + '</span>'; }).join('<span class="tk-dot" aria-hidden="true">✦</span>');
    bar.innerHTML = '<div class="tk-view" aria-live="off"><div class="tk-run"><span class="tk-seg">' + line + '</span><span class="tk-seg" aria-hidden="true">' + line + '</span></div></div>' +
      '<button type="button" class="tk-btn" aria-label="Pause or play / நிறுத்து அல்லது தொடங்கு" aria-pressed="false">⏸</button>';
    bar.hidden = false;
    var b = bar.querySelector('.tk-btn');
    b.addEventListener('click', function () { var on = bar.classList.toggle('is-paused'); b.textContent = on ? '▶' : '⏸'; b.setAttribute('aria-pressed', String(on)); });
    ['touchstart', 'mouseenter', 'focusin'].forEach(function (ev) { bar.addEventListener(ev, function () { bar.classList.add('is-hold'); }, { passive: true }); });
    ['touchend', 'mouseleave', 'focusout'].forEach(function (ev) { bar.addEventListener(ev, function () { bar.classList.remove('is-hold'); }, { passive: true }); });
  }
  build();
  setTimeout(build, 2500);   // again once the festival banner has loaded from the database
})();
