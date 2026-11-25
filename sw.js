/* Subham Astu — small offline-friendly service worker.
   Caches the page shell so the app opens fast. It never caches or answers any database call. */
var CACHE = 'subham-asthu-v8';
var SHELL = ['./', 'index.html', 'css/style.css', 'css/admin.css', 'css/theme.css', 'manifest.json', 'img/logo.png', 'img/subham-astu-emblem.png', 'img/subham-astu-emblem-192.png', 'img/favicon-32.png', 'img/favicon-64.png', 'img/apple-touch-icon.png', 'img/icon-192.png', 'img/icon-512.png'];

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
