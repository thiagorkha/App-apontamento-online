// Nome do cache
const CACHE_NAME = "producao-cache-v1";

// Arquivos que queremos deixar offline
const FILES_TO_CACHE = [
"./",
"./index.html",
"./manifest.json"
];

// Instalação do service worker
self.addEventListener("install", event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => {
return cache.addAll(FILES_TO_CACHE);
})
);
});

// Intercepta requisições e retorna cache quando offline
self.addEventListener("fetch", event => {
event.respondWith(
caches.match(event.request).then(response => {
return response || fetch(event.request);
})
);
});
