
const CACHE = 'sardinime-v1';
const FILES = ['./index.html', './icon-192.png', './icon-512.png', './manifest.json'];

// Install : mise en cache initiale
self.addEventListener('install', e => {
  self.skipWaiting(); // Active immédiatement sans attendre
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// Activate : supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prend le contrôle immédiatement
  );
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Met à jour le cache avec la nouvelle version
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request)) // Hors-ligne : utilise le cache
  );
});
