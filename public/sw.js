const CACHE = 'cmdg-v1'
const PRECACHE = ['/', '/arquivo', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e

  // Ignore non-HTTP(S) schemes (chrome-extension://, data:, blob:, etc.)
  if (!request.url.startsWith('http')) return

  const url = new URL(request.url)

  // Cache-first para assets estáticos
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // Network-first com fallback para cache nas páginas de devocional
  if (url.pathname.startsWith('/devocional') || url.pathname === '/') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Network-first para API
  if (url.pathname.includes('/api/devotional')) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match(request))
    )
  }
})
