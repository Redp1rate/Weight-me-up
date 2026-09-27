/* Service worker: offline λειτουργία μετά την πρώτη φόρτωση.
   Αύξησε το VERSION όταν ανεβάζεις νέα έκδοση του index.html. */
const VERSION = 'isozygio-v8-1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './logo-mask.png', './icon-192.png', './icon-512.png', './zxing.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Δίκτυο πρώτα για τη σελίδα (για να παίρνεις ενημερώσεις), cache αν δεν υπάρχει σύνδεση.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })));
});
