/**
 * sw.js - 数英星语游乐园 (3-in-1 Portal) 离线加速与弱网守护 Service Worker
 * 策略：
 * 1. 仅拦截同源 GET 请求（跨域字体等交由浏览器原生处理，杜绝离线报错）；
 * 2. HTML / JS / CSS 采用 Network-First（联网永远秒获最新代码，断网无缝回退缓存）；
 * 3. PNG / JPG / GIF / SVG / ICO 静态美术资源采用 Stale-While-Revalidate（二次秒开）。
 */

const CACHE_VERSION = 'chongwuyy-v20261114-course1';
const PRECACHE_URLS = [
    './',
    './index.html',
    './css/hub.css',
    './js/hub.js',
    './shared/unifiedProfile.js',
    './shared/mathEngine.js',
    './shared/courseLessons.js',
    './shared/englishEngine.js',
    './shared/questionWidgets.js',
    './shared/audioTTS.js',
    './shared/parentGate.js',
    './shared/smartChalkboard.js',
    './shared/smartChalkboard.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!req || req.method !== 'GET') return;

    let url;
    try {
        url = new URL(req.url);
    } catch (_) {
        return;
    }

    // 仅托管同源静态文件，外部请求不拦截
    if (url.origin !== self.location.origin) return;

    const isAsset = /\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(url.pathname);

    if (isAsset) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(req);
                const fetchPromise = fetch(req)
                    .then((res) => {
                        if (res && res.ok) {
                            cache.put(req, res.clone()).catch(() => {});
                        }
                        return res;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // HTML / JS / CSS：网络优先，弱网或离线时自动回退本地缓存
    event.respondWith(
        fetch(req)
            .then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_VERSION)
                        .then((cache) => cache.put(req, copy))
                        .catch(() => {});
                }
                return res;
            })
            .catch(async () => {
                const cache = await caches.open(CACHE_VERSION);
                const cached = await cache.match(req, { ignoreSearch: true });
                if (cached) return cached;
                if (req.mode === 'navigate') {
                    const fallback = await cache.match('./index.html');
                    if (fallback) return fallback;
                }
                return new Response('Offline', { status: 503, statusText: 'Offline' });
            })
    );
});
