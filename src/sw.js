const CACHE_NAME = "2023-08-29 09:30";
const urlsToCache = [
  "/tone-tts/",
  "/tone-tts/index.js",
  "/tone-tts/mora.lst",
  "/tone-tts/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
