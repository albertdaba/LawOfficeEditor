// FlowDoc Service Worker — cache CDN modules for offline use
const CACHE = 'flowdoc-v2'

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // CDN assets (esm.sh, Google Fonts): cache-first (URLs are content-addressed)
  if (
    url.hostname === 'esm.sh' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(r => {
            if (r.ok) cache.put(request, r.clone())
            return r
          }).catch(() => cached || Response.error())
        })
      )
    )
    return
  }

  // Same-origin (index.html, manifest, icon): network-first, fall back to cache
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(request)
        .then(r => {
          if (r.ok) {
            const rc = r.clone()
            caches.open(CACHE).then(c => c.put(request, rc))
          }
          return r
        })
        .catch(() => caches.match(request) || Response.error())
    )
  }
})
