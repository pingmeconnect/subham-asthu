/* Subham Astu — small offline-friendly service worker.
   Caches the page shell so the app opens fast. It never caches or answers any database call. */
var CACHE = 'subham-asthu-v32';
var SHELL = ['./', 'index.html', 'css/style.css', 'css/admin.css', 'css/theme.css', 'css/premium.css', 'css/theme-pages.css', 'css/home-stage.css', 'js/home-stage.js', 'js/reveal.js', 'js/glossary.js', 'js/textsize.js', 'js/coming-soon.js', 'js/downloads.js', 'js/panchang-core.js', 'js/astro-core.js', 'js/astro-places.js', 'js/astro.js', 'js/astro-admin.js', 'js/astro-promo.js', 'js/panchang.js', 'js/calendar.js', 'js/ticker.js', 'js/home-extras.js', 'manifest.json', 'img/logo.png', 'img/subham-astu-emblem.png', 'img/subham-astu-emblem-192.png', 'img/favicon-32.png', 'img/favicon-64.png', 'img/apple-touch-icon.png', 'img/icon-192.png', 'img/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  // Only our own files. Supabase, fonts and CDN libraries go straight to the network.
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); }); })
  );
});
