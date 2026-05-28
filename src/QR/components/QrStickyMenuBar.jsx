import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { qrT } from '../i18n/qrLocales';

export default function QrStickyMenuBar({ slug, lang, restaurantName, visible }) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-[110] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/10 dark:bg-black/95">
        <p className="min-w-0 flex-1 truncate text-base font-bold text-gray-900 dark:text-white">
          {restaurantName}
        </p>
        <Link
          to={`/q/${slug}/products`}
          className="shrink-0 rounded-full bg-[#FFA540] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#FFA540]/25 transition active:scale-[0.98]"
        >
          {qrT(lang, 'enterMenu')}
        </Link>
      </div>
    </div>
  );
}

export function useStickyMenuBarVisible(enabled = true) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [visible, setVisible] = useState(false);

  const anchorRef = useCallback((node) => {
    setAnchorEl(node);
  }, []);

  useEffect(() => {
    if (!enabled || !anchorEl) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(anchorEl);
    return () => observer.disconnect();
  }, [anchorEl, enabled]);

  return { anchorRef, stickyVisible: visible };
}
