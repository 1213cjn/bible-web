const CACHE_NAME = 'bible-v1';
// 列出你希望离线时也能访问的文件
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/index.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
  // 如果你的圣经数据是本地 JSON，也要加进来
];

// 安装阶段：把文件存入缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 核心：拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果缓存里有，直接给缓存；否则去联网下
      return response || fetch(event.request);
    })
  );
});
