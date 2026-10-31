// مسیر — service worker: keeps the app available offline
const CACHE = 'masir-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// cache-first (instant, works offline); refresh the cache in the background when online
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const keyReq = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(keyReq);
    const net = fetch(req).then(r => { if (r.ok) c.put(keyReq, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
