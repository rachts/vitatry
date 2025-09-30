// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "vitamend-offline-v1"

// Pre-cache important resources
const precacheResources = ["/", "/offline", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// Install stage sets up the offline page in the cache and opens a new cache
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

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response
            }

            // Clone the response because it's a one-time use stream
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
  } else if (event.tag === "volunteer-sync") {
    event.waitUntil(syncVolunteers())
  }
})

// Function to sync pending donations
async function syncDonations() {
  const pendingDonations = await getPendingDonations()

  for (const donation of pendingDonations) {
    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donation),
      })

      if (response.ok) {
        await removePendingDonation(donation.id)
      }
    } catch (error) {
      console.error("Failed to sync donation:", error)
    }
  }
}

// Function to sync pending volunteer applications
async function syncVolunteers() {
  const pendingVolunteers = await getPendingVolunteers()

  for (const volunteer of pendingVolunteers) {
    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(volunteer),
      })

      if (response.ok) {
        await removePendingVolunteer(volunteer.id)
      }
    } catch (error) {
      console.error("Failed to sync volunteer application:", error)
    }
  }
}

// IndexedDB functions for offline data storage
async function getPendingDonations() {
  // Implementation would use IndexedDB to retrieve pending donations
  return []
}

async function removePendingDonation(id) {
  // Implementation would use IndexedDB to remove a pending donation
}

async function getPendingVolunteers() {
  // Implementation would use IndexedDB to retrieve pending volunteer applications
  return []
}

async function removePendingVolunteer(id) {
  // Implementation would use IndexedDB to remove a pending volunteer application
}
