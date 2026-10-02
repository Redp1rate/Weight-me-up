/* Versioned app shell: η νέα έκδοση ενεργοποιείται όταν ξανανοίξει η εφαρμογή ή με «Ενημέρωση τώρα» (μετά από επιβεβαιωμένη αποθήκευση), ποτέ στη μέση επεξεργασίας. */
const VERSION='wmu-v1-1-10-7e77dba5b72d', PREFIX='wmu-';
const ASSETS=['./','./index.html','./manifest.webmanifest','./logo-mask.png','./icon-192.png','./icon-512.png','./zxing.min.js'];
// cache:'reload': η εγκατάσταση παίρνει τα αρχεία από τον διακομιστή, όχι από την HTTP cache του browser (αλλιώς η νέα έκδοση μπορεί να αποθηκεύσει το παλιό index.html).
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'}))))));
// «Ενημέρωση τώρα»: η σελίδα ζητά ενεργοποίηση μόνο αφού επιβεβαιώσει ότι αποθηκεύτηκαν τα δεδομένα.
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url),scope=new URL('./',self.location.href);
  if(e.request.method!=='GET'||url.origin!==location.origin||!url.pathname.startsWith(scope.pathname))return;
  const asset=e.request.mode==='navigate'?new URL('index.html',scope).href:e.request;
  e.respondWith(caches.open(VERSION).then(async cache=>{const hit=await cache.match(asset);return hit||fetch(e.request);}));
});
