const CACHE_NAME = 'divina-italia-stitch-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/offline.html',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Cacheando assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('Algunos assets no pudieron cachearse:', err);
            });
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Borrando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // API calls → network first
    if (url.origin === 'https://script.google.com' || url.pathname.includes('macros')) {
        event.respondWith(
            fetch(request)
                .then(response => response)
                .catch(() => caches.match('/offline.html'))
        );
        return;
    }

    // Archivos estáticos → cache first
    event.respondWith(
        caches.match(request).then(cached => {
            return cached || fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, clone);
                });
                return response;
            }).catch(() => {
                return caches.match('/offline.html');
            });
        })
    );
});
