/* NeoPos Boss — Web Push (VAPID) + PWA v3 */

const SW_VERSION = 'neopos-boss-v6';

const BOSS_AUDIT_LOGS = '/boss/audit-logs';
const BOSS_HOME = '/boss/dashboard';
const BOSS_LOGIN = '/boss/login?pwa=1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/** Chrome PWA quraşdırma meyarları üçün fetch handler mütləqdir. */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(request));
});

function resolveBossOpenUrl(raw) {
  try {
    const path = String(raw || '').trim();
    if (!path) return BOSS_HOME;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const u = new URL(path);
      if (u.pathname.startsWith('/boss')) return u.pathname + u.search;
      return BOSS_HOME;
    }
    if (path.startsWith('/boss')) return path;
    return BOSS_HOME;
  } catch {
    return BOSS_HOME;
  }
}

function absoluteUrl(path) {
  const base = self.location.origin || '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function focusOrOpenBoss(path) {
  const target = absoluteUrl(path);
  const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  for (const client of list) {
    try {
      const clientUrl = new URL(client.url);
      if (!clientUrl.pathname.startsWith('/boss')) continue;
      if ('navigate' in client) {
        await client.navigate(target);
      }
      if ('focus' in client) {
        await client.focus();
        return;
      }
    } catch {
      /* növbəti client */
    }
  }

  if (self.clients.openWindow) {
    await self.clients.openWindow(target);
  }
}

function resolveNotificationOpenPath(data, tag) {
  const fromData = resolveBossOpenUrl(data?.url);
  if (data?.url) return fromData;
  const t = String(tag || '');
  if (t.startsWith('neopos-boss-') || t.startsWith('neopos-boss-audit')) {
    return BOSS_AUDIT_LOGS;
  }
  return fromData || BOSS_AUDIT_LOGS;
}

self.addEventListener('push', (event) => {
  let data = { title: 'NeoPos', body: '', url: BOSS_AUDIT_LOGS };
  try {
    if (event.data) {
      const t = event.data.text();
      if (t) data = { ...data, ...JSON.parse(t) };
    }
  } catch {
    /* */
  }
  const title = data.title || 'NeoPos Boss';
  const body = data.body || '';
  const tag = data.tag || 'neopos-boss-audit';
  const url = resolveNotificationOpenPath(data, tag);
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url },
      vibrate: [120, 80, 120],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tag = event.notification?.tag || '';
  const url = resolveNotificationOpenPath(event.notification?.data || {}, tag);
  event.waitUntil(focusOrOpenBoss(url));
});
