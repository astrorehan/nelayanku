const CACHE_NAME = "__CACHE_NAME__";
const PRECACHE_URLS = "__PRECACHE_URLS__";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("nelayanku-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.headers.get("RSC") === "1"
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (response.ok) await cache.put(url.pathname, response.clone());
          return response;
        } catch {
          return (
            (await cache.match(url.pathname, { ignoreVary: true })) ??
            (await cache.match("/offline.html"))
          );
        }
      })(),
    );
    return;
  }
  if (
    !url.pathname.startsWith("/_next/static/") &&
    !url.pathname.startsWith("/samples/") &&
    !url.pathname.startsWith("/brand/")
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })(),
  );
});
