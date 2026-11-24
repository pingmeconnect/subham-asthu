/* Subham Asthu — language toggle + hash-based pages */
(function () {
  'use strict';

  var LANG_KEY = 'subham-asthu-lang';
  var PAGES = ['home', 'poojas', 'pooja', 'bookings', 'partner', 'about', 'faq', 'disclaimers', 'login', 'admin'];
  var root = document.documentElement;

  function readStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable: keep session only */ }
  }

  // Tamil is the default; anything other than 'en' falls back to 'ta'.
  function setLang(lang) {
    lang = lang === 'en' ? 'en' : 'ta';
    root.lang = lang;
    root.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-set-lang') === lang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    writeStored(LANG_KEY, lang);
  }

  function showPage() {
    // '#pooja/<slug>' is the pooja detail page; its nav item is 'poojas'.
    var id = (location.hash || '#home').slice(1).split('/')[0];
    if (PAGES.indexOf(id) === -1) id = 'home';
    var navId = id === 'pooja' ? 'poojas' : id === 'partner' ? 'login' : id === 'admin' ? 'login' : id;

    document.querySelectorAll('.page').forEach(function (section) {
      section.hidden = section.getAttribute('data-page') !== id;
    });
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === navId) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-set-lang'));
    });
  });

  window.addEventListener('hashchange', showPage);

  setLang(readStored(LANG_KEY) || 'ta');
  showPage();
})();
