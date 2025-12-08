const CACHE_NAME = "producao-cache-v1"

// Adicionando os ícones (referenciados no manifest.json) para garantir que sejam carregados e exibidos na instalação do PWA.
const FILES_TO_CACHE = [
  "./", 
  "./index.html", 
  "./manifest.json", 
  "./db.js",
  // Ícones do PWA incluídos aqui
  "./icon-192.png",
  "./icon-512.png"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Arquivos em cache para uso offline.')
      return cache.addAll(FILES_TO_CACHE)
    }).catch(error => {
        console.error('Service Worker: Falha ao adicionar arquivos ao cache:', error)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Estratégia Cache-First: Serve do cache se disponível, senão busca na rede.
      return response || fetch(event.request)
    }),
  )
})
