import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import OfflineBanner from '../components/OfflineBanner';
import BossAuditLiveNotify from '../components/BossAuditLiveNotify';
import BossWebPushRegister from '../components/BossWebPushRegister';
import BossWebPushBanner from '../components/BossWebPushBanner';
import BossPendingDeleteList from '../components/BossPendingDeleteList';
import BossPwaInstallOffer from '../components/BossPwaInstallOffer';
import { FiMenu, FiUser, FiLogOut, FiChevronDown, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import { isBossPanelAdmin, getStoredBossToken } from '../../utils/bossAdminAuth';
import { saveBossSession, clearBossSession } from '../../utils/bossAuthStorage';
import {
  getLicenseBannerState,
  LICENSE_MODAL_BODY_AZ,
  LICENSE_RENEWAL_PHONE_DISPLAY,
  LICENSE_RENEWAL_PHONE_TEL,
  resolveActiveCompanyPackageEnd,
} from '../../utils/companyPackageExpiry';

const BossLayout = () => {
  /** Telefon: sidebar bağlı; böyük ekran (lg+): açıq */
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [licenseInfoModalOpen, setLicenseInfoModalOpen] = useState(false);
  /** API `GET /Companies/{id}` — login DTO-da tarix bəzən gəlmir; terminal ilə eyni tarix buradan. */
  const [companyPackageEndFromApi, setCompanyPackageEndFromApi] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const licenseBanner = useMemo(() => {
    const end = companyPackageEndFromApi ?? resolveActiveCompanyPackageEnd(user);
    return getLicenseBannerState(end);
  }, [user, companyPackageEndFromApi]);

  useEffect(() => {
    try {
      document.title = 'NeoPos Boss';
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = '/site.json';
      link.type = 'application/manifest+json';
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    loadUser();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    const onStorage = (e) => {
      if (e.key === 'user') loadUser();
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const cid = String(user?.companyId || user?.CompanyId || '').trim();
    if (!cid) {
      setCompanyPackageEndFromApi(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/Companies/${cid}`);
        if (cancelled) return;
        const d = res?.data || {};
        const pe = d.packageEndDate ?? d.PackageEndDate ?? null;
        setCompanyPackageEndFromApi(pe != null && pe !== '' ? pe : null);
      } catch {
        if (!cancelled) {
          setCompanyPackageEndFromApi(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.companyId, user?.CompanyId]);

  const toggleSidebar = () => setIsOpen((v) => !v);
  const expandSidebar = () => setIsOpen(true);

  const companies = useMemo(() => {
    const list = user?.companies || user?.Companies;
    return Array.isArray(list) ? list : [];
  }, [user]);

  const activeCompanyId = String(user?.companyId || user?.CompanyId || '');

  const handleSwitchCompany = async (newCompanyId) => {
    const cid = String(newCompanyId || '');
    if (!cid || cid === activeCompanyId) return;
    setSwitching(true);
    try {
      const res = await api.post('/Auth/switch-company', { companyId: cid });
      const next = res.data || {};
      const nextCompanies = Array.isArray(next.companies) ? next.companies : (Array.isArray(next.Companies) ? next.Companies : companies);

      const merged = {
        ...user,
        ...next,
        companies: nextCompanies,
      };

      if (!isBossPanelAdmin(merged)) {
        await clearBossSession();
        window.alert('Seçilmiş şirkətdə admin hüququnuz yoxdur. Boss panelinə giriş bağlandı.');
        navigate('/boss/login');
        return;
      }

      if (merged?.token) {
        await saveBossSession({
          token: merged.token,
          user: merged,
          rememberMe: true,
        });
      } else {
        await saveBossSession({ token: getStoredBossToken(), user: merged, rememberMe: true });
      }
      setUser(merged);
      navigate(0); // bütün səhifələr companyId-ni localStorage-dən oxuyur
    } catch (err) {
      window.alert(err.response?.data?.message || err.message || 'Şirkət dəyişmədi');
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    void clearBossSession().then(() => navigate('/boss/login'));
  };

  return (
    // 1. h-screen və overflow-hidden əsas səhifənin öz-özünə scroll olmasını bağlayır
    <div className="boss-app flex h-screen overflow-hidden bg-[#f8f9fa]">
      <Toaster position="top-center" toastOptions={{ className: 'font-bold' }} />
      <OfflineBanner />
      {activeCompanyId ? <BossAuditLiveNotify companyId={activeCompanyId} /> : null}
      {activeCompanyId ? <BossWebPushRegister companyId={activeCompanyId} /> : null}
      {activeCompanyId ? <BossPendingDeleteList companyId={activeCompanyId} /> : null}
      <BossPwaInstallOffer />

      {/* 2. Sidebar artıq BossLayout daxilində flex-shrink-0 kimi yer tutur */}
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
      />

      {/* 3. Sağ tərəf (Header + Main) öz daxilində h-screen olur */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative transition-all duration-300">
        
        {/* HEADER - sticky qalır */}
        <header className="h-16 min-h-[4rem] bg-white/95 backdrop-blur-sm border-b border-slate-200/80 flex items-center justify-between gap-2 px-4 lg:px-8 flex-shrink-0 z-30 shadow-sm shadow-slate-200/40">
          <div className="flex shrink-0 items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 rounded-xl bg-gray-50 text-gray-600 active:scale-90 transition-all">
              <FiMenu size={20} />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {companies.length > 1 ? (
              <div className="flex min-w-0 max-w-[min(100%,14rem)] sm:max-w-none items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-2 py-2 sm:px-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Şirkət</span>
                <select
                  value={activeCompanyId}
                  disabled={switching}
                  onChange={(e) => handleSwitchCompany(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-tight text-gray-700 outline-none cursor-pointer disabled:opacity-50"
                >
                  {companies.map((c) => {
                    const en = String(c.companyNameEn ?? c.CompanyNameEn ?? '').trim();
                    const az = c.companyName || c.CompanyName || '';
                    return (
                    <option key={c.companyId || c.CompanyId} value={c.companyId || c.CompanyId}>
                      {en || az || '---'}
                    </option>
                    );
                  })}
                </select>
              </div>
            ) : null}
            <div className="h-6 w-px bg-gray-100 mx-1"></div>
            <div className="relative" ref={menuRef}>
              <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-gray-50 transition-all">
                <div className="text-right hidden sm:block leading-none">
                  <p className="text-xs font-black text-gray-800 mb-0.5">{user?.fullName || "Admin"}</p>
                  <p className="text-[9px] text-green-500 font-bold uppercase">Online</p>
                </div>
                <div className="w-9 h-9 bg-[#0ea5e9]/5 rounded-xl flex items-center justify-center text-[#0ea5e9] border border-[#0ea5e9]/10">
                  <FiUser size={16} />
                </div>
                <FiChevronDown size={12} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-gray-50 p-1.5 animate-fadeIn z-50">
                  <button onClick={() => { navigate('/boss/profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-2.5 p-2.5 text-gray-600 hover:bg-sky-50 hover:text-[#0ea5e9] rounded-2xl transition-all font-bold text-xs">
                    <FiUser size={14} /> Profil
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs">
                    <FiLogOut size={14} /> Çıxış
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeCompanyId ? <BossWebPushBanner /> : null}

        {licenseBanner ? (
          <div className="flex shrink-0 justify-center border-b border-slate-200 bg-slate-100/90 px-3 py-2.5 sm:px-6">
            <button
              type="button"
              onClick={() => setLicenseInfoModalOpen(true)}
              title="Lisenziya xəbərdarlığı"
              className={`w-full max-w-3xl rounded-xl font-black uppercase tracking-wide ring-white/25 transition hover:opacity-95 ${
                licenseBanner.tone === 'red'
                  ? 'flex min-h-[44px] items-center justify-center px-4 py-2.5 text-center text-[11px] leading-snug shadow-md ring-2 ring-red-400/55 sm:min-h-[52px] sm:text-[13px] bg-red-900/80 text-red-50'
                  : `px-4 py-2 text-center text-[10px] leading-snug ring-1 sm:text-[12px] ${
                      licenseBanner.tone === 'green'
                        ? 'bg-emerald-200 text-emerald-950 ring-emerald-400/50'
                        : 'bg-amber-200 text-amber-950 ring-amber-400/50'
                    }`
              }`}
            >
              {licenseBanner.label}
            </button>
          </div>
        ) : null}

        {/* 4. ƏSAS MƏZMUN - Bura öz daxilində scroll olur */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 bg-[#f8fafc] custom-scrollbar">
          <Outlet />
        </main>

        {licenseInfoModalOpen ? (
          <div
            className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="boss-license-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLicenseInfoModalOpen(false);
            }}
          >
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setLicenseInfoModalOpen(false)}
                aria-label="Bağla"
              >
                <FiX size={20} />
              </button>
              <h2 id="boss-license-modal-title" className="pr-10 text-lg font-black text-slate-900">
                Lisenziya yeniləməsi
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{LICENSE_MODAL_BODY_AZ}</p>
              <a
                href={LICENSE_RENEWAL_PHONE_TEL}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0ea5e9] py-3 text-center text-sm font-black text-white transition hover:bg-[#0284c7]"
              >
                {LICENSE_RENEWAL_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BossLayout;