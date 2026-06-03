/**
 * Ana ekrana əlavə edilmiş tətbiq (PWA) Boss girişindən açılsın.
 * Manifest `start_url` = `/?pwa=1` (path `/`) — bura redirect ETMƏ (sonsuz döngü).
 * QR (/q/...) və s. standalone açılışları → /boss/login?pwa=1
 */
export function ensureBossPwaEntry() {
  if (typeof window === 'undefined') return;

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    window.navigator.standalone === true;

  if (!isStandalone) return;

  const path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
  if (path === '/' || path.startsWith('/boss')) return;

  window.location.replace('/boss/login?pwa=1');
}
