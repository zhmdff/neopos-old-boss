import React, { useCallback, useEffect, useState } from 'react';
import { FiUser, FiKey, FiRefreshCw } from 'react-icons/fi';
import api from '../../api/axios';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const BossProfilePage = () => {
  const [stored, setStored] = useState(() => readStoredUser());
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const companyId = String(stored?.companyId ?? stored?.CompanyId ?? '').trim();
  const userId = String(stored?.id ?? stored?.Id ?? '').trim();

  const reloadLocal = useCallback(() => {
    setStored(readStoredUser());
  }, []);

  const fetchRemote = useCallback(async () => {
    if (!companyId || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/Users/${userId}`, { params: { companyId } });
      setRemote(res?.data || null);
    } catch (e) {
      setRemote(null);
      setError(e?.response?.data?.message || e?.message || 'Məlumat alınmadı');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    fetchRemote();
  }, [fetchRemote]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user') reloadLocal();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reloadLocal]);

  const fullName = remote?.fullName ?? remote?.FullName ?? stored?.fullName ?? stored?.FullName ?? '—';
  const pinRaw = remote?.pinCode ?? remote?.PinCode;
  const pinDisplay = pinRaw != null && String(pinRaw).trim() !== '' ? String(pinRaw).trim() : '—';

  return (
    <div className="mx-auto w-full max-w-6xl px-1 text-black lg:max-w-7xl xl:max-w-[90rem]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 sm:text-4xl">
            Profil
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 sm:text-sm">
            Ad və terminal şifrəsi (PIN)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reloadLocal();
            fetchRemote();
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-[#0ea5e9]/40 disabled:opacity-50"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Yenilə
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="flex min-h-[200px] flex-col justify-between rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50/90 p-8 shadow-lg shadow-slate-200/40 sm:p-10 lg:min-h-[240px] lg:p-12">
          <div className="flex items-center gap-3 text-[#0ea5e9]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0ea5e9]/10">
              <FiUser size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ad</span>
          </div>
          <p className="mt-6 text-2xl font-black uppercase leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {fullName}
          </p>
        </section>

        <section className="flex min-h-[200px] flex-col justify-between rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white to-blue-50/40 p-8 shadow-lg shadow-slate-200/40 sm:p-10 lg:min-h-[240px] lg:p-12">
          <div className="flex items-center gap-3 text-[#0ea5e9]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0ea5e9]/10">
              <FiKey size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Terminal şifrəsi (PIN)
            </span>
          </div>
          <p className="mt-6 font-mono text-3xl font-black tracking-[0.25em] text-slate-900 sm:text-4xl lg:text-5xl">
            {pinDisplay}
          </p>
        </section>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default BossProfilePage;
