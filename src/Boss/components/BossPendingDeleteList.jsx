import React, { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';

function fmtLeft(iso) {
  const ex = new Date(iso).getTime();
  if (!Number.isFinite(ex)) return '—';
  const left = Math.max(0, Math.floor((ex - Date.now()) / 1000));
  const m = Math.floor(left / 60);
  const s = left % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Terminaldan gələn silinmə / miqdar azaltma təsdiqi — bütün Boss səhifələrində altda.
 * Bəli / Xeyr (Telegramdakı ilə eyni məna). Hansı tərəf əvvəl cavab versə, keçərlidir.
 */
export default function BossPendingDeleteList({ companyId }) {
  const [items, setItems] = useState([]);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const cid = String(companyId || '').trim();
    if (!cid) {
      setItems([]);
      return;
    }
    try {
      const r = await api.get('/PendingLineDeleteConfirm/active', { params: { companyId: cid } });
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch {
      setItems([]);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 4000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onRefresh = () => void load();
    window.addEventListener('neopos-pending-delete-refresh', onRefresh);
    return () => window.removeEventListener('neopos-pending-delete-refresh', onRefresh);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const resolve = async (pendingId, accepted) => {
    const cid = String(companyId || '').trim();
    if (!cid || !pendingId) return;
    try {
      await api.post(`/PendingLineDeleteConfirm/${encodeURIComponent(pendingId)}/resolve?companyId=${cid}`, {
        accepted,
      });
      await load();
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || 'Xəta');
    }
  };

  if (!companyId || items.length === 0) return null;

  return (
    <div className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[140] max-h-[42vh] overflow-y-auto border-t border-amber-200 bg-amber-50/98 px-3 py-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:left-64">
      <p className="mb-1 text-center text-[10px] font-black uppercase tracking-widest text-amber-900/90">
        Təsdiq sorğusu (terminal)
        {items.length > 1 ? (
          <span className="ml-1 tabular-nums text-amber-800/90">· {items.length} aktiv</span>
        ) : null}
      </p>
      <p className="mb-2 text-center text-[9px] font-bold leading-snug text-amber-800/85">
        Bəli — qəbul et · Xeyr — ləğv et · Telegram və ya burada, hansı biri əvvəl cavab versə
      </p>
      <div className="flex flex-col gap-2 pb-[env(safe-area-inset-bottom,8px)]">
        {items.map((row) => (
          <div
            key={row.pendingId}
            className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[11px] font-black uppercase text-slate-900">
                {row.tableName ? `${row.tableName} · ` : ''}
                {row.productName}{' '}
                <span className="tabular-nums text-slate-600">× {row.quantity}</span>
              </div>
              {row.reasonSnapshot ? (
                <div className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-600">{row.reasonSnapshot}</div>
              ) : null}
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-rose-700 tabular-nums">
                Qalıb: {fmtLeft(row.expiresAtUtc)}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => void resolve(row.pendingId, true)}
                className="min-h-10 flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-black uppercase text-white shadow-sm active:scale-[0.98] md:flex-none"
              >
                Bəli
              </button>
              <button
                type="button"
                onClick={() => void resolve(row.pendingId, false)}
                className="min-h-10 flex-1 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-[11px] font-black uppercase text-slate-700 active:scale-[0.98] md:flex-none"
              >
                Xeyr
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
