const CACHE = 'cmdg-v3'
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

self.addEventListener('push', (e) => {
  let data = {}
  try { data = e.data?.json() ?? {} } catch { data = { body: e.data?.text() ?? '' } }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Café com Homens de Deus', {
      body: data.body || 'Seu devocional de hoje está disponível!',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = e.notification.data?.url || '/'
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
