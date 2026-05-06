// PUSPA V5 — Service Worker for PWA
const CACHE_NAME = 'puspa-v5-cache-v1'
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/manifest.json',
  '/puspa-logo-192.png',
  '/puspa-logo-512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell')
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', event => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
        }
        return fetchResponse
      })
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/offline.html') || caches.match('/')
      }
    })
  )
})
