import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiHome, FiBookOpen } from 'react-icons/fi';
import { qrT } from '../i18n/qrLocales';

export default function QrBottomNav({ active, lang }) {
  const { slug } = useParams();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md dark:border-white/10 dark:bg-black/95"
      aria-label="QR naviqasiya"
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-6">
        <Link
          to={`/q/${slug}`}
          className={`flex flex-col items-center gap-1 px-4 py-1 text-[10px] font-bold transition ${
            active === 'business' ? 'text-[#0ea5e9] dark:text-[#2DD4BF]' : 'text-gray-500 dark:text-[#8E8E93]'
          }`}
        >
          <FiHome size={22} strokeWidth={active === 'business' ? 2.5 : 2} />
          {qrT(lang, 'navBusiness')}
        </Link>
        <Link
          to={`/q/${slug}/products`}
          className={`flex flex-col items-center gap-1 px-4 py-1 text-[10px] font-bold transition ${
            active === 'menu' ? 'text-[#0ea5e9] dark:text-[#2DD4BF]' : 'text-gray-500 dark:text-[#8E8E93]'
          }`}
        >
          <FiBookOpen size={22} strokeWidth={active === 'menu' ? 2.5 : 2} />
          {qrT(lang, 'navMenu')}
        </Link>
      </div>
    </nav>
  );
}
