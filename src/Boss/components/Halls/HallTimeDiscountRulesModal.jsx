import React, { useCallback, useEffect, useState } from 'react';
import { FiClock, FiPercent, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../../api/axios';
import BossModalRoot from '../BossModalRoot';

const emptyRule = () => ({
  startTime: '18:00',
  endTime: '23:59',
  isPercentageDiscount: true,
  discountPercentage: 20,
  discountAmount: 5,
  isEnabled: true,
  label: '',
});

const HallTimeDiscountRulesModal = ({ isOpen, onClose, hallId, hallName }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyRule());

  const load = useCallback(async () => {
    if (!hallId) return;
    const companyId = JSON.parse(localStorage.getItem('user') || '{}')?.companyId;
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/HallTimeDiscountRules/by-hall/${hallId}`, { params: { companyId } });
      setRules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [hallId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const companyId = JSON.parse(localStorage.getItem('user') || '{}')?.companyId;
    if (!companyId || !hallId) return;
    setSaving(true);
    try {
      await api.post('/HallTimeDiscountRules', {
        hallId,
        companyId,
        startTime: draft.startTime,
        endTime: draft.endTime,
        isPercentageDiscount: draft.isPercentageDiscount,
        discountPercentage: Number(draft.discountPercentage) || 0,
        discountAmount: Number(draft.discountAmount) || 0,
        isEnabled: draft.isEnabled,
        label: draft.label || null,
      });
      setDraft(emptyRule());
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Əlavə olunmadı');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu qayda silinsin?')) return;
    const companyId = JSON.parse(localStorage.getItem('user') || '{}')?.companyId;
    try {
      await api.delete(`/HallTimeDiscountRules/${id}`, { params: { companyId } });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinmədi');
    }
  };

  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={onClose} maxWidth="max-w-xl">
      <div className="flex max-h-[min(90dvh,760px)] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 bg-amber-50/40 px-6 py-5">
          <div>
            <h2 className="text-lg font-black uppercase text-gray-900 sm:text-xl">Saat üzrə endirim</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-800">{hallName}</p>
            <p className="mt-2 text-xs font-medium text-slate-600">
              Masa açılanda cari saat bu aralıqdadırsa endirim avtomatik tətbiq olunur (24 saat).
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl p-2 text-gray-400 hover:bg-white">
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-6">
          <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-amber-900">Yeni qayda</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase text-gray-400">
                  <FiClock size={12} /> Başlanğıc
                </label>
                <input
                  type="time"
                  required
                  className="w-full rounded-xl border border-gray-100 bg-white px-3 py-3 font-bold"
                  value={draft.startTime}
                  onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase text-gray-400">
                  <FiClock size={12} /> Bitmə
                </label>
                <input
                  type="time"
                  required
                  className="w-full rounded-xl border border-gray-100 bg-white px-3 py-3 font-bold"
                  value={draft.endTime}
                  onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, isPercentageDiscount: true }))}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${
                  draft.isPercentageDiscount ? 'bg-[#0ea5e9] text-white' : 'bg-white border border-gray-200'
                }`}
              >
                Faiz %
              </button>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, isPercentageDiscount: false }))}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${
                  !draft.isPercentageDiscount ? 'bg-[#0ea5e9] text-white' : 'bg-white border border-gray-200'
                }`}
              >
                Məbləğ AZN
              </button>
            </div>

            {draft.isPercentageDiscount ? (
              <div>
                <label className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase text-gray-400">
                  <FiPercent size={12} /> Endirim %
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-gray-100 bg-white px-3 py-3 font-bold"
                  value={draft.discountPercentage}
                  onChange={(e) => setDraft((d) => ({ ...d, discountPercentage: e.target.value }))}
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 text-[10px] font-black uppercase text-gray-400">Endirim AZN</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-gray-100 bg-white px-3 py-3 font-bold"
                  value={draft.discountAmount}
                  onChange={(e) => setDraft((d) => ({ ...d, discountAmount: e.target.value }))}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
            >
              <FiPlus /> Əlavə et
            </button>
          </form>

          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Aktiv qaydalar</p>
            {loading ? (
              <p className="text-sm text-slate-400">Yüklənir…</p>
            ) : rules.length === 0 ? (
              <p className="text-sm text-slate-400">Hələ qayda yoxdur.</p>
            ) : (
              <ul className="space-y-2">
                {rules.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <span className="font-black text-slate-900">
                        {r.startTime} – {r.endTime}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold text-emerald-700">
                        {r.isPercentageDiscount
                          ? `${r.discountPercentage}% endirim`
                          : `${r.discountAmount} AZN endirim`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </BossModalRoot>
  );
};

export default HallTimeDiscountRulesModal;
