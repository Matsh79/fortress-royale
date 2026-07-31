self.addEventListener('install', e=>self.skipWaiting());
self.addEventListener('activate', e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch', e=>{
  e.respondWith(fetch(e.request).then(r=>{
    if(e.request.method==='GET' && new URL(e.request.url).origin===location.origin){
      const c=r.clone(); caches.open('fr-v1').then(cache=>cache.put(e.request,c));
    }
    return r;
  }).catch(()=>caches.match(e.request)));
});
