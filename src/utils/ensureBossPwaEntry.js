/**
 * Ana ekrana əlavə edilmiş tətbiq (PWA) həmişə Boss panelindən açılsın.
 * QR (/q/...) və ya əsas səhifədən əlavə edilsə belə, standalone rejimdə /boss-a yönləndirir.
 */
export function ensureBossPwaEntry() {
  if (typeof window === 'undefined') return;

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    window.navigator.standalone === true;

  if (!isStandalone) return;

  const path = window.location.pathname || '';
  if (path.startsWith('/boss')) return;

  window.location.replace('/?pwa=1');
}
