// Cache name for storing assets
const CACHE_NAME = 'search-app-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/static/search.js',
    '/static/main.js',
    '/static/style.css',
    '/static/search.svg',
    '/static/settings.svg',
    '/index.html'
];


self.addEventListener('fetch', event => {
    console.log(event.request.url)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return cached version
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache important resources
                        if (event.request.url.includes('static')) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, response.clone()));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return index.html for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline content not available');
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => 
                {
                    return cache.addAll(STATIC_ASSETS)
                })
    );
    console.log('Service Worker activated');
});

self.addEventListener('install', event => {
    console.log('Service Worker installed');
});