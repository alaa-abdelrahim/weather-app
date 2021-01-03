const shellCashName = "shell-assets-v2";

const shellCashSrcs = [
    '/',
    '/index.html',

    '/favicon.png',

    'assets/styles/style.css',

    'assets/scripts/index.js',

    'https://fonts.gstatic.com/s/raleway/v17/1Ptug8zYS_SKggPNyC0ITw.woff2',

    '/assets/images/Cloud-background.png',
    '/assets/images/cursor.png',

    '/assets/images/Snow.png',
    '/assets/images/Sleet.png',
    '/assets/images/Hail.png',
    '/assets/images/Thunderstorm.png',
    '/assets/images/HeavyRain.png',
    '/assets/images/LightRain.png',
    '/assets/images/Shower.png',
    '/assets/images/HeavyCloud.png',
    '/assets/images/LightCloud.png',
    '/assets/images/Clear.png',
];

// install event

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(shellCashName).then(function (cache) {
            return cache.addAll(shellCashSrcs);
        })
    );
});

// activate event

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName !== shellCashName;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
})

// fetch event

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(shellCashName).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request);
            });
        })
    );
});