/**
 * Dulhaniya Service Worker - PWA Offline Caching & Background Sync
 * Version: 1.1.0
 */

const CACHE_NAME = "dulhaniya-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/admin.html",
  "/privacy.html",
  "/css/styles.css",
  "/js/data.js",
  "/js/cart.js",
  "/js/tracker.js",
  "/js/partner.js",
  "/js/admin.js",
  "/js/app.js",
  "/manifest.json"
];

// Install: Cache core static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for static files, Network-First for API
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== "GET") return;

  // For API endpoints, prefer network first, fallback to offline response
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(JSON.stringify({ offline: true, error: "Network offline, using local data." }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // For static assets, use Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
