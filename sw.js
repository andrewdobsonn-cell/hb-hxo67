// Minimal offline shell: cache the app files, always go to network for data.
const CACHE = 'homebase-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // The page itself skips the browser's HTTP cache so a new version shows on next open.
  const req = e.request.mode === 'navigate' ? new Request(e.request, { cache: 'no-cache' }) : e.request;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});
