// 오프라인에서도 게임이 켜지도록 파일을 저장해 둔다.
// 인터넷이 되면 항상 새 파일을 먼저 받아서 저장하고(업데이트 반영), 안 되면 저장해 둔 파일을 쓴다.
const CACHE = 'monhap-v162';
const CORE = ['./', './index.html', './style.css', './game.js', './i18n.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable.png', './opening.mp4'];

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
  // 인터넷이 느리면(3.5초) 저장해 둔 파일로 먼저 켜고, 새 파일은 뒤에서 받아 둔다
  // 게임 화면(html)과 게임 코드는 브라우저 임시 저장(최대 10분)을 건너뛰고 항상 서버에서 새로 받는다
  const fresh = req.mode === 'navigate' || /\.(html|js|css)$/.test(url.pathname) || url.pathname.endsWith('/');
  const net = fetch(fresh && url.origin === self.location.origin ? new Request(req, { cache: 'no-cache' }) : req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  });
  // ?v=숫자 가 달라도 같은 파일로 찾는다
  const cached = () => caches.match(req, { ignoreSearch: true });
  e.respondWith(new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => { cached().then(hit => finish(hit)); }, 3500);
    net.then(res => { clearTimeout(timer); finish(res); })
      .catch(() => { clearTimeout(timer); cached().then(hit => hit ? finish(hit) : caches.match('./index.html').then(x => finish(x || Response.error()))); });
  }));
  e.waitUntil(net.catch(() => {}));
});
