/* Guarda la app en el aparato para que abra rápido; si hay versión nueva, la baja. */
const V='botones-v30';
const FILES=['./','index.html','juego.html','ver.html','app.css','race.css','cmd.css','app.js','version.js','news.js','lite.css','avatars.js','logros.js','tienda.js','vendor/qrcode.js','manifest.webmanifest',
  'fonts/lilita.woff2','fonts/rubik-500.woff2','fonts/rubik-700.woff2','fonts/rubik-800.woff2',
  'icons/icon-192.png','icons/icon-512.png','vendor/paho-mqtt.min.js',
  'sounds/lr.mp3','sounds/ya.mp3','sounds/bz0.mp3','sounds/bz1.mp3','sounds/fin.mp3','sounds/rec.mp3','sounds/went.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* primero la red (para estrenar cambios), y si no hay internet, lo guardado */
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const req=e.request.mode==='navigate'?e.request:new Request(e.request,{cache:'no-cache'});
  e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))))});
