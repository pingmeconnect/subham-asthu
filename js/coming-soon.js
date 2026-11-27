/* Sankalpam — "coming soon" message for services that are not open yet:
   priests, cooks, pooja-material orders, astrology. Pooja guides + Downloads stay fully working.
   To open a service later, delete its word from SOON_PAGES (and the data-soon attribute of its tile). */
(function () {
  'use strict';
  var SOON_PAGES = /^#(bookings|order)(\/|$)/;
  var TEXT = {
    priest:   ['வாத்தியார் புக்கிங்', 'Priest booking'],
    cook:     ['சமையல்காரர் புக்கிங்', 'Cook booking'],
    order:    ['பூஜைப் பொருட்கள் ஆன்லைன் ஆர்டர்', 'Online pooja-items order'],
    astrology:['ஜோதிடர் ஆலோசனை', 'Astrologer consultation'],
    matching: ['திருமணப் பொருத்தம் (ஜாதகம்)', 'Marriage horoscope matching'],
    temple:   ['திருக்கோவில் தரிசனம்', 'Temple darshan'],
    spiritual:['ஆன்மிக வழிகாட்டி', 'Spiritual guide'],
    general:  ['இந்த சேவை', 'This service']
  };
  var last = '#home', box = null;

  function bi(a) { return '<span class="ta">' + a[0] + '</span><span class="en">' + a[1] + '</span>'; }
  function kindOf(h) {
    if (/priest/.test(h)) return 'priest';
    if (/cook/.test(h)) return 'cook';
    if (/^#order/.test(h)) return 'order';
    return 'general';
  }
  function build() {
    box = document.createElement('div');
    box.className = 'soon-dim'; box.hidden = true;
    box.innerHTML = '<div class="soon-box" role="dialog" aria-modal="true" aria-labelledby="soon-t">' +
      '<img src="img/subham-astu-emblem-192.png" alt="">' +
      '<p><span class="soon-badge">' + bi(['விரைவில் வருகிறது', 'Coming soon']) + '</span></p>' +
      '<h2 id="soon-t"></h2>' +
      '<p>' + bi(['இந்தச் சேவைக்கான பணி நடைபெற்று வருகிறது. விரைவில் உங்களுக்காகத் திறக்கப்படும்.', 'Work in progress. We are getting this ready and will open it for you very soon.']) + '</p>' +
      '<p>' + bi(['இப்போது பூஜை வழிகாட்டிகளை (PDF) இலவசமாகப் பதிவிறக்கலாம்.', 'You can already download our pooja guides (PDF) today.']) + '</p>' +
      '<div class="soon-act"><a class="btn btn-gold" href="#downloads" data-soon-close>' + bi(['பூஜை வழிகாட்டிகள்', 'Open pooja guides']) + '</a>' +
      '<button type="button" class="btn btn-outline" data-soon-close>' + bi(['சரி', 'OK']) + '</button></div></div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('[data-soon-close]')) box.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });
  }
  function show(kind) {
    if (!box) build();
    // Admin can change each service's text (Admin > விரைவில் வரும் உரைகள்); the built-in text is the fallback.
    var fallback = TEXT[kind] || TEXT.general, key = 'text_soon_' + kind;
    var ta = (window.SASettings && SASettings.text(key, 'ta')) || fallback[0];
    var en = (window.SASettings && SASettings.text(key, 'en')) || fallback[1];
    box.querySelector('#soon-t').innerHTML = bi([ta, en]);
    box.hidden = false;
    var b = box.querySelector('.btn-outline'); if (b) b.focus();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href'), k = a.getAttribute('data-soon');
    if (k || SOON_PAGES.test(h)) { e.preventDefault(); e.stopPropagation(); show(k || kindOf(h)); }
  }, true);

  function check() {
    if (SOON_PAGES.test(location.hash)) {            // typed link, bookmark or a button inside a page
      var kind = kindOf(location.hash);
      location.hash = last;                          // go back to where the person was
      show(kind);
    } else { last = location.hash || '#home'; }
  }
  window.addEventListener('hashchange', check);
  if (document.readyState !== 'loading') check(); else document.addEventListener('DOMContentLoaded', check);
})();
