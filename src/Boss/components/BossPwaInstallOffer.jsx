import React, { useCallback, useEffect, useState } from 'react';
import { FiDownload, FiShare2, FiX } from 'react-icons/fi';
import {
  bossPwaIconUrl,
  dismissBossPwaInstallOffer,
  isAndroidChrome,
  isBossPwaStandalone,
  isBossServiceWorkerControlling,
  isIosSafari,
  isMobileWebBrowser,
  isPwaInstallDismissed,
  registerBossServiceWorker,
  shouldOfferBossPwaInstall,
} from '../utils/bossPwaInstall';
import { subscribeBossWebPush } from '../utils/bossWebPushSubscribe';

/**
 * Boss (/boss) — telefonda «Ana ekrana əlavə» və ya Chrome «Proqram kimi yüklə».
 * Standalone: ünvan sətri yoxdur; Web Push (BossWebPushBanner) daha rahat işləyir.
 */
export default function BossPwaInstallOffer() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [busy, setBusy] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [swReady, setSwReady] = useState(() => isBossServiceWorkerControlling());

  useEffect(() => {
    if (!shouldOfferBossPwaInstall()) {
      setVisible(false);
      return;
    }
    setIosMode(isIosSafari());
    setVisible(true);
    void registerBossServiceWorker().then(() => {
      setSwReady(isBossServiceWorkerControlling());
    });
  }, []);

  useEffect(() => {
    if (!visible || swReady) return undefined;
    const onCtrl = () => setSwReady(true);
    navigator.serviceWorker?.addEventListener('controllerchange', onCtrl);
    return () => navigator.serviceWorker?.removeEventListener('controllerchange', onCtrl);
  }, [visible, swReady]);

  useEffect(() => {
    if (!visible || isBossPwaStandalone()) return undefined;

    const onBip = (e) => {
      e.preventDefault();
      setDeferred(e);
      setIosMode(false);
    };
    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
      window.dispatchEvent(new Event('neopos-boss-pwa-installed'));
      void subscribeBossWebPush({ requestPermission: true });
    };

    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [visible]);

  const onInstall = useCallback(async () => {
    if (!deferred || busy) return;
    setBusy(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === 'accepted') {
        setVisible(false);
        window.dispatchEvent(new Event('neopos-boss-pwa-installed'));
        void subscribeBossWebPush({ requestPermission: true });
      }
    } catch {
      /* */
    } finally {
      setDeferred(null);
      setBusy(false);
    }
  }, [deferred, busy]);

  const onDismiss = () => {
    dismissBossPwaInstallOffer(3);
    setVisible(false);
  };

  if (!visible || isBossPwaStandalone() || isPwaInstallDismissed()) {
    return null;
  }

  if (!isMobileWebBrowser()) return null;

  const canChromeInstall = Boolean(deferred);
  const androidChrome = isAndroidChrome();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[10002] border-t border-sky-200 bg-white/98 shadow-[0_-8px_32px_rgba(14,165,233,0.15)] backdrop-blur-md"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="NeoPos Boss — proqram kimi yüklə"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <img
            src={bossPwaIconUrl()}
            alt=""
            width={52}
            height={52}
            className="h-[52px] w-[52px] shrink-0 rounded-2xl border border-sky-100 bg-white object-contain p-1 shadow-sm"
          />
          <div className="min-w-0 text-left">
            <p className="text-[13px] font-black leading-snug text-slate-900">
              NeoPos Boss — telefonda proqram kimi
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-600">
              {iosMode && !canChromeInstall ? (
                <>
                  <FiShare2 className="mr-1 inline-block align-text-bottom" size={14} />
                  Safari: əsas səhifədə (<span className="font-bold text-sky-700">saytın kökü</span>,
                  login görünən URL) <span className="font-bold text-sky-700">Paylaş</span> →{' '}
                  <span className="font-bold text-sky-700">Ana ekrana əlavə et</span>. Köhnə ikon
                  404 verirsə, silin və yenidən əlavə edin.
                </>
              ) : androidChrome && !canChromeInstall ? (
                swReady ? (
                  <>
                    Chrome: <span className="font-bold text-sky-700">⋮</span> →{' '}
                    <span className="font-bold text-sky-700">Tətbiqi quraşdır</span> və ya{' '}
                    <span className="font-bold text-sky-700">Əsas ekrana əlavə et</span>. Düzgün
                    quraşdırma — açılanda ünvan sətiri olmur (tam proqram).
                  </>
                ) : (
                  <>
                    Proqram quraşdırılsın deyə bir dəfə{' '}
                    <span className="font-bold text-sky-700">səhifəni yeniləyin</span>, sonra ⋮ →{' '}
                    <span className="font-bold text-sky-700">Əsas ekrana əlavə et</span>.
                  </>
                )
              ) : (
                <>
                  Chrome-da səhifə kimi yox — <span className="font-bold text-sky-700">proqram kimi yüklə</span>.
                  İş masasından açılanda tam ekran; audit bildirişləri üçün «Bildirişlər» düyməsindən
                  sonra aktiv edin.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2">
          {canChromeInstall ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onInstall()}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-600 disabled:opacity-50 active:scale-[0.98]"
            >
              <FiDownload size={16} aria-hidden />
              {busy ? '…' : 'Yüklə'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50"
          >
            <FiX size={14} aria-hidden />
            Sonra
          </button>
        </div>
      </div>
    </div>
  );
}
