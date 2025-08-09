const CACHE_VERSION='shiftcal-v1.0.0';
const ASSETS=['./','./index-modern-pwa.html','./style-modern.css?v=1','./app-modern.js?v=1','./holidays-modern.json?v=1','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(
      caches.match(e.request).then(cached=>{
        if(cached) return cached;
        return fetch(e.request).then(res=>{
          if(e.request.method==='GET'){
            const clone=res.clone(); caches.open(CACHE_VERSION).then(c=>c.put(e.request, clone));
          }
          return res;
        }).catch(()=>cached);
      })
    );
  }
});