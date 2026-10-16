// Learn to Code: works offline once opened online (16 Oct 2026).
// The guide itself is fetched NETWORK FIRST: whenever you're online you get the newest
// version, and the copy kept here is only used when there's no signal. So a kept copy can
// never get stuck on an old version. Icons and the manifest are kept and used as they are.
// Bump CACHE only when THIS file changes (Section 19: "a cache with no version never updates").
var CACHE = 'ltc-v1';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // sync server, videos: straight through
  var isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (isPage) {
    e.respondWith(fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }); }
      return res;
    }).catch(function () {
      return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) { return r || fetch(req); }));
});
