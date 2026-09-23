/* =========================================================
   BUSINESS PROFIT ANALYZER
   Service Worker
   ========================================================= */

const CACHE_NAME = "business-profit-analyzer-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {
    console.log("Business Profit Analyzer: Service Worker installing...");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(APP_FILES);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {
    console.log("Business Profit Analyzer: Service Worker activated.");

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(networkResponse => {

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {
                            return networkResponse;
                        }

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(
                                    event.request,
                                    responseClone
                                );
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        return caches.match("./index.html");
                    });
            })
    );
});