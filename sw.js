/* La versión se define en version.js (cambiala ahí cuando modifiques cualquier archivo,
   así los celulares descargan la versión nueva). */
importScripts('version.js');
const CACHE = 'tabata-' + APP_VERSION;

const ASSETS = [
  './',
  'index.html',
  'style.css',
  'version.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'sounds/1-sound.ogg',
  'sounds/2-sound.ogg',
  'sounds/3-sound.ogg',
  'sounds/buzzer-sound.ogg',
  'sounds/end-sound.ogg',
  'sounds/fight-bell-sound.ogg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // Uno por uno: si falta un archivo, los demás igual se guardan
      .then((cache) => Promise.allSettled(ASSETS.map((a) => cache.add(new Request(a, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(event.request)
        .then((res) => {
          if (res.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});
