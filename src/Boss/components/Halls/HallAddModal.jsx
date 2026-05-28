import React, { useState } from 'react';
import { FiX, FiPercent, FiLayers } from 'react-icons/fi';
import api from '../../../api/axios';
import BossModalRoot from '../BossModalRoot';

const HallAddModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAz: '',
    servicePercentage: 0,
    isGuestCountEnabled: true,
    isTableHourActive: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nameAz.trim()) {
      alert('Zal adını daxil edin!');
      return;
    }

    setLoading(true);
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      await api.post('/Halls', {
        ...formData,
        companyId: user?.companyId,
      });

      onRefresh();
      onClose();
      setFormData({ nameAz: '', servicePercentage: 0, isGuestCountEnabled: true, isTableHourActive: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Zal yaradılarkən xəta baş verdi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={onClose} maxWidth="max-w-md">
      <div className="flex max-h-[min(90dvh,680px)] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-50 bg-gray-50/50 px-6 py-5">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 sm:text-2xl">Yeni zal</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase italic text-gray-400">Məkan tənzimləmələri</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2.5 text-gray-400 transition-all hover:bg-white hover:text-red-500"
          >
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          <div>
            <label className="mb-2 ml-1 flex items-center gap-2 text-xs font-black uppercase text-gray-400">
              <FiLayers className="text-[#0ea5e9]" /> Zalın adı
            </label>
            <input
              type="text"
              required
              placeholder="Məsələn: Teras, VIP zal…"
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]"
              value={formData.nameAz}
              onChange={(e) => setFormData({ ...formData, nameAz: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 ml-1 flex items-center gap-2 text-xs font-black uppercase text-gray-400">
              <FiPercent className="text-[#0ea5e9]" /> Servis haqqı (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-black text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]"
                value={formData.servicePercentage}
                onChange={(e) => setFormData({ ...formData, servicePercentage: e.target.value })}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-slate-700">Qonaq sayı</div>
              <div className="text-[11px] font-semibold text-slate-400">Bu zalda masa açanda qonaq sayı soruşulsun</div>
            </div>
            <button
              type="button"
              onClick={() => setFormData((s) => ({ ...s, isGuestCountEnabled: !s.isGuestCountEnabled }))}
              className={`h-9 w-16 rounded-full border transition-colors ${
                formData.isGuestCountEnabled ? 'border-emerald-400 bg-emerald-500' : 'border-slate-200 bg-slate-200'
              }`}
              aria-pressed={formData.isGuestCountEnabled}
            >
              <span
                className={`block h-7 w-7 rounded-full bg-white shadow transition-transform ${
                  formData.isGuestCountEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3.5">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-amber-900">Masa saat limiti</div>
              <div className="text-[11px] font-semibold text-amber-700/80">
                Hər masanın öz limiti (məs. 3:00) — terminalda timer
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData((s) => ({ ...s, isTableHourActive: !s.isTableHourActive }))}
              className={`h-9 w-16 rounded-full border transition-colors ${
                formData.isTableHourActive ? 'border-amber-500 bg-amber-500' : 'border-slate-200 bg-slate-200'
              }`}
              aria-pressed={formData.isTableHourActive}
            >
              <span
                className={`block h-7 w-7 rounded-full bg-white shadow transition-transform ${
                  formData.isTableHourActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-1 w-full rounded-2xl bg-[#0ea5e9] py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#0ea5e9]/20 transition-all active:scale-[0.98] sm:text-base ${loading ? 'cursor-not-allowed opacity-70' : 'hover:bg-sky-600'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Yadda saxlanılır…</span>
              </div>
            ) : (
              'Zalı təsdiqlə'
            )}
          </button>
        </form>
      </div>
    </BossModalRoot>
  );
};

export default HallAddModal;
