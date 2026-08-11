const CACHE = 'chami-v24-phonics-tactile-scaffolds';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './config/family.js',
  './curriculum/data.js',
  './js/app.js',
  './js/ai-client.js',
  './js/learner-model.js',
  './js/calibration.js',
  './js/transfer.js',
  './js/curriculum-engine.js',
  './js/curriculum-quality.js',
  './js/phonics-engine.js',
  './js/literacy-model.js',
  './js/pwa.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/auro.png',
  './assets/teia.png',
  './assets/chami.png',
  './assets/peach.png',
  './assets/world.png',
  './assets/chami-logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
