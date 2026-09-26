// 오프라인에서도 게임이 켜지도록 파일을 저장해 둔다.
// 인터넷이 되면 항상 새 파일을 먼저 받아서 저장하고(업데이트 반영), 안 되면 저장해 둔 파일을 쓴다.
const CACHE = 'monhap-v11';
const CORE = ['./', './index.html', './style.css', './game.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable.png', './opening.mp4'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 이 게임의 파일과 친구 대전 라이브러리(PeerJS)만 저장한다
  if (url.origin !== self.location.origin && url.hostname !== 'cdnjs.cloudflare.com') return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      // ?v=숫자 가 달라도 같은 파일로 찾는다
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))),
  );
});
