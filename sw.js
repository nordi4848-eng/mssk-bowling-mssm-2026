const CACHE_NAME = 'mssk-bowling-2026-v5-7-6';
const CORE = ['./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate' || req.destination === 'document' || new URL(req.url).pathname.endsWith('/index.html');
  if (isPage || req.url.includes('supabase.co')) {
    event.respondWith(fetch(req).then(resp => {
      if (isPage) { const copy=resp.clone(); caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy)); }
      return resp;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
    const copy=resp.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); return resp;
  })));
});
