// sw.js

// Increment this version number whenever you update any of the cached files.
const CACHE_VERSION = 3; // Incremented version to trigger a new install
const CACHE_NAME = `divine-words-cache-v${CACHE_VERSION}`;

// A comprehensive list of all files, including legacy scripts.
const urlsToCache = [
  // Root and HTML files
  './',
  'index.html',
  'app.html',
  'datamanager.html',
  'tools.html',
  'exporter.html',
  'audiovisual_settings.html',
  'audiovisual_manager.html',
  'help.html',
  'manifest.json',

  // CSS Files
  'styles/style.css',
  'styles/base.css',
  'styles/components/buttons.css',
  'styles/components/modals.css',
  'styles/components/navbar.css',
  'styles/components/side_panel.css',
  'styles/pages/datamanager.css',
  'styles/pages/exporter.css',
  'styles/pages/index.css',

  // LEGACY JavaScript Files from /scripts/ folder
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
  
  // NEW Refactored JavaScript Modules
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

  // App Icons
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png',

  // External Libraries
  'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&family=Roboto+Slab:wght@400;700&display=swap',
  'https://unpkg.com/tippy.js@6/dist/tippy.css',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://unpkg.com/@popperjs/core@2',
  'https://unpkg.com/tippy.js@6'
];

// --- INSTALL Event ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event in progress.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell...');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('[Service Worker] App shell caching complete.');
    })
  );
});

// --- ACTIVATE Event ---
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event in progress.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- FETCH Event ---
// Implements a "Network first, falling back to Cache" strategy.
self.addEventListener('fetch', (event) => {
  // We only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // 1. Try to fetch from the network first.
    fetch(event.request)
      .then((networkResponse) => {
        // If the fetch is successful, we should cache the new response.
        // It's important to clone the response, as it can only be consumed once.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
            // Only cache valid (200 OK) responses.
            if (responseToCache.status === 200) {
              cache.put(event.request, responseToCache);
            }
        });
        
        // Return the fresh response from the network.
        return networkResponse;
      })
      .catch(() => {
        // 2. If the network fetch fails (e.g., user is offline),
        // we then try to find a match in the cache.
        console.log(`[Service Worker] Network failed for ${event.request.url}. Attempting to serve from cache.`);
        return caches.match(event.request).then((cachedResponse) => {
            // If a cached response is found, return it.
            if (cachedResponse) {
                return cachedResponse;
            }
            // If the request is not in the cache either, the browser will handle the error.
            // (You could return a custom offline page here if you wanted to).
            return new Response("You are offline and this resource isn't cached.", {
              status: 404,
              statusText: "Offline and not in cache",
              headers: new Headers({ "Content-Type": "text/plain" }),
            });
        });
      })
  );
});
