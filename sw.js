/* Orbit service worker: works offline, picks up new versions by itself.
   V changes with every release, so the browser sees a new worker and the page reloads into it. */
var V="orbit-20261111-2";
var FILES=["./","index.html","lessons.js","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){return Promise.all(FILES.map(function(f){return fetch(new Request(f,{cache:"reload"})).then(function(r){if(r.ok)return c.put(f,r)})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
function timeout(ms){return new Promise(function(_,rej){setTimeout(function(){rej(new Error("timeout"))},ms)})}
self.addEventListener("fetch",function(e){
  var r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  var net=fetch(r).then(function(res){if(res&&res.status===200){var c=res.clone();caches.open(V).then(function(ca){return ca.put(r,c)}).catch(function(){})}return res});
  e.respondWith(Promise.race([net,timeout(3000)]).catch(function(){
    return caches.match(r,{ignoreSearch:true}).then(function(m){return m||net.catch(function(){return caches.match("index.html")})});
  }));
});
