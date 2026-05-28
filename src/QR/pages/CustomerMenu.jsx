import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { FiWifi, FiChevronRight, FiClock, FiSun, FiMoon, FiArrowRight } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import HeroSlider from '../components/HeroSlider';
import QrWifiSheet from '../components/QrWifiSheet';
import QrLanguageSheet from '../components/QrLanguageSheet';
import QrHoursSheet from '../components/QrHoursSheet';
import QrBottomNav from '../components/QrBottomNav';
import QrSocialAndMap from '../components/QrSocialAndMap';
import QrFlagIcon from '../components/QrFlagIcon';
import QrStickyMenuBar, { useStickyMenuBarVisible } from '../components/QrStickyMenuBar';
import { useQrLang, useQrTheme } from '../hooks/useQrTheme';
import { QR_LANGS, isLikelyOpenNow, qrT } from '../i18n/qrLocales';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const CustomerMenu = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggle } = useQrTheme();
  const { lang, setLang } = useQrLang(slug);
  const [wifiOpen, setWifiOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    axios
      .get(`${apiBase}/QRMenu/full-menu/${slug}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error('Xəta:', err))
      .finally(() => setLoading(false));
  }, [slug, apiBase]);

  const settings = data?.settings || {};
  const workingHours = settings.workingHours || settings.WorkingHours || '09:00 - 23:00';
  const openNow = isLikelyOpenNow(workingHours);
  const currentLang = QR_LANGS.find((l) => l.code === lang) || QR_LANGS[0];
  const wifiSsid = settings.wifiName || settings.WifiName || '—';
  const { anchorRef: menuAnchorRef, stickyVisible } = useStickyMenuBarVisible(Boolean(data));
  const restaurantName = data?.nameAz || data?.name || '';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FFA540]/30 border-t-[#FFA540]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center dark:bg-black dark:text-white">
        <h2 className="text-lg font-black">{qrT(lang, 'notFound')}</h2>
        <Link to="/" className="text-sm font-bold text-[#FFA540] underline">
          neopos.az
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] pb-24 transition-colors duration-300 dark:bg-black">
      <Toaster position="top-center" />

      <QrStickyMenuBar
        slug={slug}
        lang={lang}
        restaurantName={restaurantName}
        visible={stickyVisible}
      />

      <HeroSlider
        images={settings.galleryImages}
        name={data?.nameAz}
        data={data}
        settings={settings}
        lang={lang}
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-2">
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWifiOpen(true)}
            className="flex min-h-[88px] flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200/80 transition active:scale-[0.98] dark:bg-[#1C1C1E] dark:ring-0"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{qrT(lang, 'wifiConnect')}</span>
              <FiWifi className="text-[#38bdf8]" size={22} />
            </div>
            <span className="truncate text-xs font-medium text-gray-500 dark:text-[#8E8E93]">{wifiSsid}</span>
          </button>

          <button
            type="button"
            onClick={() => setLangOpen(true)}
            className="flex min-h-[88px] flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200/80 transition active:scale-[0.98] dark:bg-[#1C1C1E] dark:ring-0"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{qrT(lang, 'changeLang')}</span>
              <QrFlagIcon langCode={lang} size={28} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-[#8E8E93]">{currentLang.label}</span>
          </button>
        </div>

        <Link
          ref={menuAnchorRef}
          to={`/q/${slug}/products`}
          className="mb-6 flex w-full items-center justify-between gap-3 rounded-full bg-[#FFA540] px-5 py-4 text-base font-bold text-white shadow-lg shadow-[#FFA540]/25 transition active:scale-[0.98]"
        >
          <FaUtensils size={22} className="shrink-0 opacity-95" aria-hidden />
          <span className="flex-1 text-center">{qrT(lang, 'enterMenu')}</span>
          <FiArrowRight size={22} className="shrink-0" strokeWidth={2.5} aria-hidden />
        </Link>

        <h3 className="mb-2 px-1 text-sm font-bold text-gray-900 dark:text-white">{qrT(lang, 'general')}</h3>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-[#1C1C1E] dark:ring-0">
          <button
            type="button"
            onClick={() => setHoursOpen(true)}
            className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left transition active:bg-gray-50 dark:border-white/10 dark:active:bg-white/5"
          >
            <FiClock className="shrink-0 text-gray-600 dark:text-white/70" size={20} />
            <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{qrT(lang, 'workingHours')}</span>
            <span
              className={`mr-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                openNow
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/15 text-red-600 dark:text-red-400'
              }`}
            >
              {openNow ? qrT(lang, 'openNow') : qrT(lang, 'closedNow')}
            </span>
            <FiChevronRight className="text-gray-400 dark:text-[#8E8E93]" size={18} />
          </button>

          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-gray-50 dark:active:bg-white/5"
          >
            {darkMode ? (
              <FiMoon className="shrink-0 text-gray-600 dark:text-white/70" size={20} />
            ) : (
              <FiSun className="shrink-0 text-gray-600 dark:text-white/70" size={20} />
            )}
            <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{qrT(lang, 'colorMode')}</span>
            <span className="mr-1 text-xs font-medium text-gray-500 dark:text-[#8E8E93]">
              {darkMode ? qrT(lang, 'dark') : qrT(lang, 'light')}
            </span>
            <FiChevronRight className="text-gray-400 dark:text-[#8E8E93]" size={18} />
          </button>
        </div>

        <QrSocialAndMap lang={lang} settings={settings} company={data} darkMode={darkMode} />
      </div>

      <QrBottomNav active="business" lang={lang} />

      <QrWifiSheet open={wifiOpen} onClose={() => setWifiOpen(false)} settings={settings} lang={lang} />
      <QrLanguageSheet open={langOpen} onClose={() => setLangOpen(false)} lang={lang} onSelect={setLang} />
      <QrHoursSheet
        open={hoursOpen}
        onClose={() => setHoursOpen(false)}
        lang={lang}
        workingHours={workingHours}
      />
    </div>
  );
};

export default CustomerMenu;
