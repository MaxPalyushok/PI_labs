const CACHE_NAME = 'pwa_cache'
const urls_to_cache = [
    '/pages/students.html',
    '/pages/dashboard.html',
    '/pages/tasks.html',

    '/scripts/students.js',
    
    '/styles/controls.css',
    '/styles/header.css',
    '/styles/modal.css',
    '/styles/pagination.css',
    '/styles/table.css',
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urls_to_cache);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cache_names) {
            return Promise.all(
                cache_names.map(function(cache) {
                    if (cache != CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    )
});