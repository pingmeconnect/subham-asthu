/* Subham Astu — one friendly pop-up on the home page so every visitor knows about the Astrologer Consultation.
   Shows once a day, a moment after the home page opens. Never on other pages. */
(function () {
  'use strict';
  var KEY = 'sa-astro-promo', DAY = 24 * 3600 * 1000, box = null;
  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }
  function seenRecently() { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < DAY; } catch (e) { return true; } }
  function mark() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ } }
  function onHome() { var h = location.hash || '#home'; return h === '#home' || h === '#' || h === ''; }
  function close() { if (box) { box.hidden = true; } mark(); }
  function build() {
    box = document.createElement('div');
    box.className = 'soon-dim'; box.hidden = true;
    box.innerHTML = '<div class="soon-box" role="dialog" aria-modal="true" aria-labelledby="ap-t">' +
      '<img src="img/subham-astu-emblem-192.png" alt="">' +
      '<p><span class="soon-badge">' + bi('புதியது', 'NEW') + '</span></p>' +
      '<h2 id="ap-t">' + bi('ஜோதிடர் ஆலோசனை', 'Astrologer Consultation') + '</h2>' +
      '<p>' + bi('பிறந்த விவரம் தந்தால் உடனே உங்கள் ஜாதகம். உங்கள் கேள்விகளுக்கு ஜோதிடர் எழுத்து மூலம் பதில் தருவார்.', 'Enter your birth details and see your chart instantly. Our astrologer answers your questions in writing.') + '</p>' +
      '<p><b>' + bi('🎁 முதல் கேள்வி இலவசம்!', '🎁 Your first question is FREE!') + '</b></p>' +
      '<div class="soon-act"><a class="btn btn-gold" href="#astrology" data-ap-go>' + bi('இப்போது முயற்சி செய்யுங்கள்', 'Try it now') + '</a>' +
      '<button type="button" class="btn btn-outline" data-ap-later>' + bi('பிறகு', 'Maybe later') + '</button></div></div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('[data-ap-later]') || e.target.closest('[data-ap-go]')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box && !box.hidden) close(); });
  }
  function maybeShow() {
    if (!onHome() || seenRecently()) return;
    if (document.querySelector('.soon-dim:not([hidden])')) return;
    if (!box) build();
    box.hidden = false;
    var b = box.querySelector('[data-ap-go]'); if (b) b.focus();
  }
  // tapping the tile itself counts as "seen"
  document.addEventListener('click', function (e) { if (e.target.closest('.svc-astro')) mark(); });
  setTimeout(maybeShow, 2200);
})();
