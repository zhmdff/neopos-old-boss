const DISMISS_KEY = 'neopos_boss_pwa_install_dismissed_until';

export function isBossPwaStandalone() {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator?.standalone === true
    );
  } catch {
    return !!window.navigator?.standalone;
  }
}

export function isBossRoute() {
  if (typeof window === 'undefined') return false;
  return (window.location.pathname || '').startsWith('/boss');
}

export function isIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!iOS) return false;
  return !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function isMobileWebBrowser() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia('(max-width: 1023px)').matches) return true;
  } catch {
    /* */
  }
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

export function isPwaInstallDismissed() {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

export function dismissBossPwaInstallOffer(days = 3) {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 86400000));
  } catch {
    /* */
  }
}

export function shouldOfferBossPwaInstall() {
  if (!isBossRoute()) return false;
  if (isBossPwaStandalone()) return false;
  if (!isMobileWebBrowser()) return false;
  if (isPwaInstallDismissed()) return false;
  return true;
}

export function bossPwaIconUrl() {
  return '/icon-192.png';
}

/** Chrome PWA quraşdırma meyarları üçün SW (push ilə eyni fayl). */
export async function registerBossServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    await navigator.serviceWorker.ready;
    try {
      await reg.update();
    } catch {
      /* */
    }
    return reg;
  } catch {
    return null;
  }
}

export function isAndroidChrome() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|Brave|SamsungBrowser/i.test(ua);
}

export function isBossServiceWorkerControlling() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  return Boolean(navigator.serviceWorker.controller);
}
