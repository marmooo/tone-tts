const CACHE_NAME="2023-08-29 09:30",urlsToCache=["/tone-tts/","/tone-tts/index.js","/tone-tts/mora.lst","/tone-tts/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js"];self.addEventListener("install",a=>{a.waitUntil(caches.open(CACHE_NAME).then(a=>a.addAll(urlsToCache)))}),self.addEventListener("fetch",a=>{a.respondWith(caches.match(a.request).then(b=>b||fetch(a.request)))}),self.addEventListener("activate",a=>{a.waitUntil(caches.keys().then(a=>Promise.all(a.filter(a=>a!==CACHE_NAME).map(a=>caches.delete(a)))))})