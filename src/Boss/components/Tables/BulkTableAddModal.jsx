import React, { useMemo, useState } from 'react';
import { FiHash, FiLayers, FiX, FiUsers } from 'react-icons/fi';
import api from '../../../api/axios';
import BossModalRoot from '../BossModalRoot';
import TableHourLimitField from './TableHourLimitField';
import { parseTableHourLimitInput } from '../../../utils/tableHourLimitInput';

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const BulkTableAddModal = ({ isOpen, onClose, onRefresh, hallId, hallName, isTableHourActive = false }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [form, setForm] = useState({
    prefix: 'Masa',
    count: 35,
    start: 1,
    capacity: 2,
    tableHourLimit: '3:00',
  });

  const canSubmit = useMemo(() => {
    const count = Math.trunc(num(form.count, 0));
    const start = Math.trunc(num(form.start, 1));
    const cap = Math.trunc(num(form.capacity, 2));
    const prefix = String(form.prefix || '').trim();
    return prefix.length > 0 && count > 0 && count <= 300 && start >= 0 && cap >= 1;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const companyId = user?.companyId;
      if (!companyId || !hallId) throw new Error('Company/Hall tapılmadı');

      const prefix = String(form.prefix || '').trim();
      const count = Math.trunc(num(form.count, 0));
      const start = Math.trunc(num(form.start, 1));
      const capacity = Math.trunc(num(form.capacity, 2));
      let tableHourLimitMinutes = null;
      if (isTableHourActive) {
        tableHourLimitMinutes = parseTableHourLimitInput(form.tableHourLimit);
        if (!tableHourLimitMinutes) {
          alert('Masa limitini daxil edin (məs. 3:00 və ya 1:30)');
          setLoading(false);
          return;
        }
      }

      const hallRes = await api.get(`/Tables/ByHall/${hallId}`, { params: { companyId } });
      const existing = Array.isArray(hallRes.data) ? hallRes.data : [];
      const maxOrder = existing.reduce(
        (m, t) => Math.max(m, Number(t.orderIndex ?? t.OrderIndex ?? 0) || 0),
        0,
      );

      const items = Array.from({ length: count }, (_, idx) => ({
        nameAz: `${prefix} ${start + idx}`,
        orderIndex: maxOrder + idx + 1,
      }));

      setProgress({ done: 0, total: count });

      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        await api.post('/Tables', {
          nameAz: it.nameAz,
          capacity,
          depositAmount: 0,
          depositStartTime: null,
          depositEndTime: null,
          hallId,
          companyId,
          orderIndex: it.orderIndex,
          tableHourLimitMinutes: isTableHourActive ? tableHourLimitMinutes : null,
        });
        setProgress({ done: i + 1, total: count });
      }

      await onRefresh?.();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={onClose} maxWidth="max-w-lg">
      <div className="flex max-h-[min(90dvh,720px)] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-50 bg-emerald-50/30 px-6 py-5">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg font-black uppercase leading-tight text-gray-900 sm:text-2xl">Toplu masa əlavə et</h2>
            <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-emerald-800">Zal: {hallName}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-2xl p-2 text-gray-400 transition-all hover:bg-white">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2">
                <FiLayers size={12} /> Ad (prefix)
              </label>
              <input
                type="text"
                required
                placeholder="Məsələn: Masa"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold"
                value={form.prefix}
                onChange={(e) => setForm((s) => ({ ...s, prefix: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2">
                <FiHash size={12} /> Say
              </label>
              <input
                type="number"
                min="1"
                max="300"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold"
                value={form.count}
                onChange={(e) => setForm((s) => ({ ...s, count: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2">
                <FiHash size={12} /> Başlanğıc
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold"
                value={form.start}
                onChange={(e) => setForm((s) => ({ ...s, start: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2">
                <FiUsers size={12} /> Tutum (hamısı üçün)
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold"
                value={form.capacity}
                onChange={(e) => setForm((s) => ({ ...s, capacity: e.target.value }))}
              />
            </div>
          </div>

          {isTableHourActive ? (
            <TableHourLimitField
              value={form.tableHourLimit}
              onChange={(v) => setForm((s) => ({ ...s, tableHourLimit: v }))}
            />
          ) : null}

          {loading && (
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
              Yaradılır: {progress.done}/{progress.total}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="mt-2 w-full rounded-[2rem] bg-[#0ea5e9] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#0ea5e9]/20 transition-all active:scale-[0.99] disabled:opacity-60 sm:rounded-[2.5rem] sm:py-5 sm:text-lg"
          >
            {loading ? 'Yaradılır…' : 'Toplu yarat'}
          </button>
        </form>
      </div>
    </BossModalRoot>
  );
};

export default BulkTableAddModal;
