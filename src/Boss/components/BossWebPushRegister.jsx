import { useEffect, useRef } from 'react';
import { syncBossWebPushSubscription, subscribeBossWebPush } from '../utils/bossWebPushSubscribe';

const RESYNC_MS = 6 * 60 * 60 * 1000;

/**
 * Boss PWA: Web Push abunəliyi — proqram bağlı olanda da SW bildiriş göndərir.
 * İcazə verildikdən sonra avtomatik; yoxdursa BossWebPushBanner göstərilir.
 */
export default function BossWebPushRegister({ companyId }) {
  const triedRef = useRef(false);

  useEffect(() => {
    const cid = String(companyId || '').trim().toLowerCase();
    if (!cid) return;
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) return;

    let cancelled = false;

    const run = async (requestPermission = false) => {
      try {
        const perm =
          typeof Notification !== 'undefined' ? Notification.permission : 'denied';
        if (perm === 'denied') return;

        const r =
          perm === 'granted'
            ? await syncBossWebPushSubscription()
            : requestPermission
              ? await subscribeBossWebPush({ requestPermission: true })
              : null;

        if (cancelled || !r) return;
        if (r === 'denied' || r === 'no-vapid' || r === 'unsupported') return;
      } catch (e) {
        if (!triedRef.current) {
          triedRef.current = true;
          console.warn('BossWebPushRegister:', e?.message || e);
        }
      }
    };

    void run(false);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void run(false);
    };
    const onFocus = () => void run(false);
    const onPwaInstalled = () => void run(true);

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('neopos-boss-pwa-installed', onPwaInstalled);

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void run(false);
    }, RESYNC_MS);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('neopos-boss-pwa-installed', onPwaInstalled);
      window.clearInterval(interval);
    };
  }, [companyId]);

  return null;
}
