import React, { useState, useEffect } from 'react';
import PageMeta from '../../PageMeta';
import { FiUser, FiLock, FiArrowRight, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { isBossPanelAdmin, getStoredBossToken, parseStoredBossUser } from '../../utils/bossAdminAuth';
import {
  saveBossSession,
  getRememberMePreference,
} from '../../utils/bossAuthStorage';
import {
  isLicenseBlockedMessage,
  LICENSE_RENEWAL_PHONE_DISPLAY,
  LICENSE_RENEWAL_PHONE_TEL,
} from '../../utils/companyPackageExpiry';
import BossPwaInstallOffer from '../components/BossPwaInstallOffer';
import PasswordInput from '../../components/PasswordInput';

const BossLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(() => getRememberMePreference());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [licenseExpiredModalText, setLicenseExpiredModalText] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredBossToken();
    const user = parseStoredBossUser();
    if (token && isBossPanelAdmin(user)) {
      navigate('/boss/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post('/Auth/login', formData);
      const userData = response.data;

      if (userData && userData.token) {
        const companies = Array.isArray(userData.companies) ? userData.companies : (Array.isArray(userData.Companies) ? userData.Companies : []);
        const normalized = {
          ...userData,
          companies,
        };

        if (!isBossPanelAdmin(normalized)) {
          setError('Boss panelinə yalnız admin rolü olan istifadəçilər daxil ola bilər.');
          return;
        }

        await saveBossSession({
          token: normalized.token,
          user: normalized,
          rememberMe,
        });

        navigate('/boss/dashboard');
      } else {
        setError("Məlumatlar alınarkən xəta baş verdi.");
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const apiStr = typeof apiMsg === 'string' ? apiMsg.trim() : '';
      if (apiStr && isLicenseBlockedMessage(apiStr)) {
        setLicenseExpiredModalText(apiStr);
        setError('');
      } else {
        setError(apiStr || 'İstifadəçi adı və ya şifrə yanlışdır!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boss-app min-h-screen flex items-center justify-center bg-[#f8f9ff] px-4">
      <PageMeta title="Boss Login | NeoPos" description="Şirkət sahibi üçün idarəetmə panelinə giriş" />

      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-40 h-20 bg-[#0ea5e9] rounded-3xl shadow-xl shadow-[#0ea5e9]/20 mb-4">
            <span className="text-white text-3xl font-bold italic tracking-tighter uppercase">NeoPos</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Xoş gəldiniz!</h2>
          <p className="text-gray-500 mt-2 font-medium">Panelinizə daxil olmaq üçün məlumatlarınızı yazın</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm text-center border border-red-100 font-bold animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">İstifadəçi adı</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <FiUser size={18} />
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-all disabled:opacity-50 font-medium"
                  placeholder="admin_boss"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Şifrə</label>
              <PasswordInput
                required
                disabled={loading}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-all disabled:opacity-50 font-medium"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              >
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <FiLock size={18} />
                </span>
              </PasswordInput>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
              />
              <span className="text-sm font-bold text-slate-700">
                Məni xatırla (tətbiqi bağlasanız belə daxil qalın)
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#0ea5e9]/30 active:scale-[0.97] transition-all disabled:bg-blue-300"
            >
              {loading ? "Giriş edilir..." : "Daxil ol"} {!loading && <FiArrowRight strokeWidth={3} />}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-gray-400 text-sm font-bold uppercase tracking-widest opacity-50">
          NeoPos © 2026
        </p>
      </div>

      {licenseExpiredModalText ? (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="boss-login-license-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLicenseExpiredModalText(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
              onClick={() => setLicenseExpiredModalText(null)}
              aria-label="Bağla"
            >
              <FiX size={22} />
            </button>
            <h2 id="boss-login-license-title" className="pr-10 text-lg font-black leading-snug text-slate-900">
              Lisenziyanın müddəti bitib
            </h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">{licenseExpiredModalText}</p>
            <a
              href={LICENSE_RENEWAL_PHONE_TEL}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0ea5e9] py-3 text-center text-sm font-black text-white transition hover:bg-[#0284c7]"
            >
              {LICENSE_RENEWAL_PHONE_DISPLAY}
            </a>
            <button
              type="button"
              onClick={() => setLicenseExpiredModalText(null)}
              className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Bağla
            </button>
          </div>
        </div>
      ) : null}

      <BossPwaInstallOffer />
    </div>
  );
};

export default BossLogin;