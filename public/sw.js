// Service Worker for VitaMend - Offline Support

const CACHE = "vitamend-offline-v2"

// Pre-cache important resources
const precacheResources = ["/", "/offline", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// Install stage sets up the offline page in the cache
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(precacheResources)))
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key)
          }
        }),
      ),
    ),
  )
  return self.clients.claim()
})

// Fetch event - serve from cache if possible, otherwise fetch from network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached response if found
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the fetched resource
            caches.open(CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // If fetch fails (offline), show offline page
            if (event.request.mode === "navigate") {
              return caches.match("/offline")
            }
          })
      }),
    )
  }
})

// Background sync for pending submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "donation-sync") {
    event.waitUntil(syncDonations())
  }
})

// Function to sync pending donations (simplified - uses IndexedDB in real impl)
async function syncDonations() {
  // Firebase handles sync automatically when online
  console.log("Sync triggered - Firebase will handle data sync")
}
