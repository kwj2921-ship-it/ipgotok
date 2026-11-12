// 입고톡 모바일 앱 - 화면 파일 저장 (인터넷이 없어도 열리게)
const C = "ipgo-20261112143356";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const shell = u.origin === location.origin;
  const sdk = u.host === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/");
  if (!shell && !sdk) return;   // 데이터(Firebase) 통신은 건드리지 않습니다
  if (shell) {   // 화면 파일 : 인터넷 먼저, 안 되면 저장본
    e.respondWith(fetch(e.request).then((res) => {
      if (res && res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
    const cp = res.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return res;
  })));
});
