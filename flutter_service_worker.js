'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/assets/fonts/IRANSansMobile_Light_fa.ttf": "5b24f0eb79e12468b0b33f50daa543aa",
"assets/assets/fonts/IRANSansMobile_UltraLight_fa.ttf": "d870b02ba33e62d12d4491086802752d",
"assets/assets/fonts/IRANSansMobile_Medium_fa.ttf": "f2e4b38c405ac29cce593b4cc30d2cce",
"assets/assets/images/heart-outline.png": "0a6d86aac033acd2a32ef091674d4890",
"assets/assets/images/4.jpeg": "bf9b585ec8e42cd6d7525d321ef69d31",
"assets/assets/images/heart.png": "d0afd3fa8b46108275a37c73fd953b8d",
"assets/assets/images/supermarket-cover.png": "11f9d1ad12bf9fc588c0c8586ebe5077",
"assets/assets/images/offer_1.jpg": "b84603644b07171faeb11952c7dd71f8",
"assets/assets/images/3.jpeg": "10fa0c6a6593cb2b7735e4ff2cb3bd7f",
"assets/assets/images/offer_3.jpg": "6618b242963459c7e0dc9bfcc43d5c72",
"assets/assets/images/back_toolbar_main.png": "41272434dd800aaba439b61921f9949c",
"assets/assets/images/pin.png": "4dfd1b330235985be91dcae48151d2dc",
"assets/assets/images/chat-background.jpg": "c6da95b75a1a7b37d857013228e15976",
"assets/assets/images/5.jpeg": "581328cf5a9f5f697cfdadb9156f09c3",
"assets/assets/images/hyperstar-logo.png": "df2576f84464da10bf2dba86a4ec5008",
"assets/assets/images/hyperstar-cover.png": "33effb0fe1417f7ec20671a0a3e41ca9",
"assets/assets/images/supermarket-logo.png": "837cdaadeb6d2f8f0ecb15d1b2f1d42d",
"assets/assets/images/2.jpeg": "aa0e1046e8a709764b170df3003d696e",
"assets/assets/images/logo.png": "d45d23cbf8a1f044f3f9f7e4a962924c",
"assets/assets/images/ic_nav.png": "5cb182498630481afcd92e29bfd09839",
"assets/assets/images/offer_2.jpg": "8db0d21a8c4b2734bf647bf747ec698d",
"assets/assets/images/1.jpeg": "19c31fdf2ac4fcb3436d3e405563b8aa",
"assets/FontManifest.json": "d33674253e92d4b327a3ce0dcc2f39a5",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/NOTICES": "40b1715b117ec1df3e7681c2ca90f328",
"assets/AssetManifest.json": "ec846847afceb3d7e1f5d7e0a34398d9",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"main.dart.js": "d775838a3c6b9af31a1594cc332fcf09",
"index.html": "b519a97adfea45da2747a15bc4fe6899",
"/": "b519a97adfea45da2747a15bc4fe6899",
"manifest.json": "d1c06a887096d58944869a42defaf0c8",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a 'reload' param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'reload'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
