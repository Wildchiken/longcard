const SHELL_CACHE = 'longcard-shell-v1.0.3'
const ASSET_CACHE = 'longcard-assets-v1.0.3'

const SHELL_URLS = ['/', '/gallery', '/compose']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ??
            (await caches.match('/compose')) ??
            (await caches.match('/'))
          return cached ?? new Response('Offline', { status: 503 })
        })
    )
    return
  }

  if (request.method === 'GET') {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        return cached ?? fetchPromise
      })
    )
  }
})
