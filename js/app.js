/* Sankalpam — language toggle + hash-based pages */
(function () {
  'use strict';

  var LANG_KEY = 'subham-asthu-lang';
  var PAGES = ['home', 'poojas', 'order', 'pooja', 'bookings', 'partner', 'about', 'help', 'faq', 'disclaimers', 'privacy', 'terms', 'downloads', 'panchang', 'rasi', 'astrology', 'astro-admin', 'login', 'admin'];
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
    document.querySelectorAll('option[data-en]').forEach(function (o) {
      o.textContent = lang === 'en' ? o.getAttribute('data-en') : o.getAttribute('data-ta');
    });
    writeStored(LANG_KEY, lang);
  }

  function showPage() {
    // '#pooja/<slug>' is the pooja detail page; its nav item is 'poojas'.
    var id = (location.hash || '#home').slice(1).split('/')[0];
    if (PAGES.indexOf(id) === -1) id = 'home';
    var navId = id === 'pooja' || id === 'order' ? 'poojas' : id === 'partner' ? 'login' : id === 'admin' || id === 'astro-admin' ? 'login' : id;

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

  // Installable app: a small service worker caches the pages so the app opens fast, even on a weak network.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js?v=33').catch(function () { /* optional */ });
    });
  }

  setLang(readStored(LANG_KEY) || 'ta');
  showPage();
})();
