const CACHE_NAME = 'site-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'app.html',
  'datamanager.html',
  'tools.html',
  'exporter.html',
  'audiovisual_settings.html',
  'audiovisual_manager.html',
  'help.html',
  'styles/style.css',
  'styles/base.css',
  'styles/components/buttons.css',
  'styles/components/modals.css',
  'styles/components/navbar.css',
  'styles/components/side_panel.css',
  'styles/pages/datamanager.css',
  'styles/pages/exporter.css',
  'styles/pages/index.css',
  'scripts/script.js',
  'scripts/main_app_script.js',
  'scripts/datamanager_script.js',
  'scripts/exporter_script.js',
  'scripts/extractor_script.js',
  'scripts/audiovisual_integrations.js',
  'scripts/audiovisual_settings_script.js',
  'scripts/audiovisual_manager.js',
  'scripts/bulk_reference_compiler.js',
  'scripts/cross_ref_manager.js',
  'scripts/notes_manager.js',
  'scripts/openbible_topics_importer.js',
  'scripts/side_panel_manager.js',
  'js/core/app.js',
  'js/core/bibleManager.js',
  'js/core/collectionManager.js',
  'js/core/timer.js',
  'js/database/db.js',
  'js/pages/index.js',
  'js/ui/modals.js',
  'js/ui/navbar.js',
  'js/ui/settings.js',
  'js/ui/statusBar.js',
  'js/utils/constants.js',
  'js/utils/parser.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        event.waitUntil(
          fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              return caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
            }
          })
        );
        return response;
      }
      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});  'js/core/collectionManager.js',
  'js/core/timer.js',
  'js/database/db.js',
  'js/pages/index.js',
  'js/ui/modals.js',
  'js/ui/navbar.js',
  'js/ui/settings.js',
  'js/ui/statusBar.js',
  'js/utils/constants.js',
  'js/utils/parser.js',

  // Icons
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png'
];

// External resources which might be opaque/no-cors responses. We'll attempt to fetch them but won't fail install if they cannot be cached.
const externalResources = [
  'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&family=Roboto+Slab:wght@400;700&display=swap',
  'https://unpkg.com/tippy.js@6/dist/tippy.css',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://unpkg.com/@popperjs/core@2',
  'https://unpkg.com/tippy.js@6'
];

// Utility: Returns true for same-origin requests
function isSameOrigin(requestUrl) {
  try {
    const reqUrl = new URL(requestUrl, self.location.href);
    return reqUrl.origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

// INSTALL: Precache app shell. Use Promise.allSettled so one failing external resource doesn't block install.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add same-origin items first using cache.addAll for better performance and integrity.
      try {
        await cache.addAll(urlsToCache);
        console.log('[Service Worker] Pre-cached same-origin resources.');
      } catch (err) {
        // If cache.addAll fails (e.g., a missing file), fallback to adding items individually to continue install.
        console.warn('[Service Worker] cache.addAll failed, attempting to cache individually:', err);
        await Promise.all(urlsToCache.map(async (url) => {
          try {
            const resp = await fetch(new Request(url, { cache: 'reload' }));
            if (resp && resp.ok) await cache.put(url, resp);
          } catch (e) {
            console.warn('[Service Worker] Failed to cache', url, e);
          }
        }));
      }

      // Attempt to fetch and cache external resources but do not fail install if they can't be cached.
      await Promise.allSettled(externalResources.map(async (url) => {
        try {
          const resp = await fetch(url, { mode: 'no-cors' });
          // Even opaque responses can be stored; put them only if a response is returned.
          if (resp) await cache.put(url, resp.clone());
        } catch (e) {
          console.warn('[Service Worker] External resource failed to cache:', url, e);
        }
      }));

      // Ensure the service worker activates immediately without waiting.
      await self.skipWaiting();
    })()
  );
});

// ACTIVATE: Clean up old caches and take control of clients.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => {
        if (name !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache:', name);
          return caches.delete(name);
        }
      }));
      await self.clients.claim();
    })()
  );
});

// FETCH: Offline-first strategy for navigation and static assets.
// - Try cache first. If not found, go to network and cache the successful response.
// - For navigations, try to serve index.html from cache first for SPA behavior.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = event.request.url;

  // Avoid handling requests to browser extensions or other non-http(s) protocols
  if (!requestUrl.startsWith('http')) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Navigation requests: treat as cache-first and fallback to network, then to offline fallback.
    if (event.request.mode === 'navigate') {
      const cachedNav = await cache.match(OFFLINE_FALLBACK);
      if (cachedNav) {
        return cachedNav;
      }

      try {
        const networkResponse = await fetch(event.request);
        // Cache successful navigation responses (HTML) for future navigations
        if (networkResponse && networkResponse.ok) {
          await cache.put(OFFLINE_FALLBACK, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // If network fails and no cached index.html, try to return any cached page, else return fallback offline message
        const fallback = await cache.match(OFFLINE_FALLBACK);
        if (fallback) return fallback;
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain' } });
      }
    }

    // For other GET requests: prefer cache, then network, then cache fallback.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      // Asynchronously update the cache in the background (stale-while-revalidate)
      event.waitUntil((async () => {
        try {
          const networkResp = await fetch(event.request);
          if (networkResp && networkResp.ok) {
            await cache.put(event.request, networkResp.clone());
          }
        } catch (e) {
          // Ignore network errors during background update
        }
      })());

      return cachedResponse;
    }

    // If not cached, try network and cache the result for future use.
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse && networkResponse.ok) {
        try {
          await cache.put(event.request, networkResponse.clone());
        } catch (e) {
          // Some requests (cross-origin, opaque) may throw when trying to cache; ignore.
        }
      }
      return networkResponse;
    } catch (err) {
      // If network fails, try to return any cached fallback or respond with a simple message.
      const fallback = await cache.match(OFFLINE_FALLBACK);
      if (fallback) return fallback;
      return new Response("You are offline and this resource isn't cached.", {
        status: 503,
        statusText: 'Offline and not in cache',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    }
  })());
});
