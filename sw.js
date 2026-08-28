const CACHE_NAME = 'mssk-bowling-2026-v5-4';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Network-first for Supabase/API so live data stays current.
  if (req.url.includes('supabase.co')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Network-first for app pages so installed users receive updates without reinstalling.
  if (req.mode === 'navigate' || req.url.endsWith('/index.html') || req.url.endsWith('/')) {
    event.respondWith(fetch(req).then(resp => { const copy=resp.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); return resp; }).catch(()=>caches.match(req).then(x=>x||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => { const copy=resp.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req, copy)); return resp; })));
});
