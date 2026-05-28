import React, { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { getBossWebPushStatus, subscribeBossWebPush } from '../utils/bossWebPushSubscribe';
import { isBossPwaStandalone } from '../utils/bossPwaInstall';

export default function BossWebPushBanner() {
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const refresh = async () => {
      if (sessionStorage.getItem('neopos_boss_push_banner_dismiss') === '1') {
        if (!cancelled) setHidden(true);
        return;
      }
      const status = await getBossWebPushStatus();
      if (cancelled) return;
      if (status === 'ok' || status === 'denied' || status === 'unsupported') {
        setHidden(true);
        return;
      }
      setHidden(false);
    };

    void refresh();
    window.addEventListener('neopos-boss-push-synced', refresh);
    window.addEventListener('neopos-boss-pwa-installed', refresh);

    return () => {
      cancelled = true;
      window.removeEventListener('neopos-boss-push-synced', refresh);
      window.removeEventListener('neopos-boss-pwa-installed', refresh);
    };
  }, []);

  if (hidden) return null;

  const onEnable = async () => {
    setBusy(true);
    setHint('');
    try {
      const r = await subscribeBossWebPush({ requestPermission: true });
      if (r === 'ok') {
        window.dispatchEvent(new Event('neopos-boss-push-synced'));
        setHidden(true);
        return;
      }
      if (r === 'denied') {
        setHint('Bildirişlər bloklanıb. Chrome → Sayt parametrləri → Bildirişlər → İcazə ver.');
      } else if (r === 'no-vapid') {
        setHint('Serverdə Web Push konfiqurasiyası yoxdur (VAPID açarları).');
      } else if (r === 'unsupported') {
        setHint('iPhone: əvvəlcə «Ana ekrana əlavə et», sonra buradan aktiv edin.');
      } else {
        setHint('Qoşulma alınmadı. Yenidən cəhd edin.');
      }
    } catch (e) {
      setHint(e?.response?.data?.message || e?.message || 'Xəta');
    } finally {
      setBusy(false);
    }
  };

  const standalone = isBossPwaStandalone();

  return (
    <div className="mx-4 mt-3 mb-0 rounded-2xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 z-20 relative">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center shrink-0">
          <FiBell size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black text-[#0f172a]">
            {standalone ? 'Proqram bildirişləri' : 'Telefon bildirişləri'}
          </div>
          <div className="text-[11px] font-bold text-slate-600 mt-0.5 leading-snug">
            Terminalda seçdiyiniz hadisələr (məhsul silinmə, masa köçürmə və s.) proqram bağlı
            olanda belə telefon bildirişi kimi gələcək. Bir dəfə «Aktiv et» basın.
          </div>
          {hint ? <p className="text-[10px] font-bold text-amber-800 mt-1">{hint}</p> : null}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onEnable()}
          className="px-4 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {busy ? '...' : 'Aktiv et'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            sessionStorage.setItem('neopos_boss_push_banner_dismiss', '1');
            setHidden(true);
          }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500"
        >
          Sonra
        </button>
      </div>
    </div>
  );
}
