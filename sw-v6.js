
self.addEventListener('install', event => {
  event.waitUntil(caches.open('shiftcal-v6').then(cache => cache.addAll([
    './','./index.html','./styles.css','./manifest.webmanifest','./holidays.json','./icon-192.png','./icon-512.png'
  ])));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
