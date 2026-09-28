/* Service worker: λειτουργία offline και ανθεκτικότητα.
   Αύξησε το VERSION όταν ανεβάζεις νέα έκδοση. */
const VERSION = 'isozygio-v10-2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './logo-mask.png', './icon-192.png', './icon-512.png', './zxing.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // Οι παλιές εκδόσεις σβήνονται μόνο αφού η νέα έχει αποθηκευτεί πλήρως
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Δίκτυο πρώτα, αλλά ΜΟΝΟ έγκυρη απάντηση (200) αντικαθιστά την αποθηκευμένη σελίδα.
    // Σε σφάλμα (404, 5xx) ή χωρίς σύνδεση, ανοίγει η τελευταία καλή έκδοση.
    e.respondWith(fetch(req).then(r => {
      if (r && r.ok && r.status === 200) { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return r; }
      return caches.match('./index.html').then(hit => hit || r);
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
