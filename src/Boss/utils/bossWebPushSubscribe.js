import api from '../../api/axios';

const SUBSCRIBED_AT_KEY = 'neopos_boss_push_subscribed_at';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function isBossWebPushSupported() {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getBossNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/** Brauzerdə aktiv push abunəliyi var? */
export async function getBossPushSubscription() {
  if (!isBossWebPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export function isBossWebPushMarkedSubscribed() {
  try {
    return Boolean(localStorage.getItem(SUBSCRIBED_AT_KEY));
  } catch {
    return false;
  }
}

/**
 * Abunə lazımdır? (icazə yoxdur və ya serverə yazılmayıb)
 * @returns {Promise<'ok'|'needs-permission'|'needs-subscribe'|'denied'|'unsupported'|'no-vapid'>}
 */
export async function getBossWebPushStatus() {
  if (!isBossWebPushSupported()) return 'unsupported';
  const token = localStorage.getItem('token');
  if (!token) return 'needs-subscribe';

  const perm = getBossNotificationPermission();
  if (perm === 'denied') return 'denied';
  if (perm !== 'granted') return 'needs-permission';

  const sub = await getBossPushSubscription();
  if (!sub) return 'needs-subscribe';
  if (!isBossWebPushMarkedSubscribed()) return 'needs-subscribe';
  return 'ok';
}

/**
 * Boss PWA / Chrome: Web Push abunəliyini serverə yazır.
 * Proqram bağlı olanda bildiriş SW (sw.js) vasitəsilə gəlir.
 * @returns {Promise<'ok'|'no-vapid'|'unsupported'|'denied'|'error'>}
 */
export async function subscribeBossWebPush(options = {}) {
  const { requestPermission = true } = options;

  if (!isBossWebPushSupported()) return 'unsupported';

  const token = localStorage.getItem('token');
  if (!token) return 'error';

  const { data } = await api.get('/PushSubscriptions/vapid-public-key');
  const publicKey = data?.publicKey ?? data?.PublicKey;
  if (!publicKey || typeof publicKey !== 'string') return 'no-vapid';

  let perm = getBossNotificationPermission();
  if (perm === 'default' && requestPermission) {
    perm = await Notification.requestPermission();
  }
  if (perm !== 'granted') return 'denied';

  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  const reg = await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = sub.toJSON();
  const endpoint = json.endpoint;
  const key = json.keys;
  if (!endpoint || !key?.p256dh || !key?.auth) return 'error';

  await api.post('/PushSubscriptions', {
    endpoint,
    keys: { p256dh: key.p256dh, auth: key.auth },
  });

  try {
    localStorage.setItem(SUBSCRIBED_AT_KEY, String(Date.now()));
  } catch {
    /* */
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('neopos-boss-push-synced'));
  }

  return 'ok';
}

/** İcazə verilibsə serverə yenidən yaz (proqram hər açılanda). */
export async function syncBossWebPushSubscription() {
  if (!isBossWebPushSupported()) return 'unsupported';
  if (getBossNotificationPermission() !== 'granted') return 'denied';
  return subscribeBossWebPush({ requestPermission: false });
}
