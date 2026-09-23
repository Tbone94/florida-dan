// FLORIDA DAN — offline + installable. One cache per build (sw.js?v=<build>, the same stamp as the
// scripts). The page itself is network-first so a push shows up right away; everything else is
// cache-first (every script URL carries its build stamp, so a new build never collides with an old one).
'use strict';
const V = new URL(self.location).searchParams.get('v') || 'dev', CACHE = 'florida-dan-' + V;
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    // precache every stamped script the page loads, so the game works offline after one visit
    const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
    const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => './' + m[1]);
    await Promise.all(srcs.map(u => c.add(u).catch(() => { })));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('florida-dan-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {   // the page: fresh when online, cached when not
    // always revalidate the page with GitHub, never trust a stale HTTP copy
    e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
