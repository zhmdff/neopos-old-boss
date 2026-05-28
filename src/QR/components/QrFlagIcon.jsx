import React from 'react';

/** Dil bayrağı — AZ, RU, EN (GB) */
const FLAG_ISO = { az: 'az', ru: 'ru', en: 'gb' };

export function QrFlagIcon({ langCode, size = 32, className = '' }) {
  const iso = FLAG_ISO[langCode] || langCode || 'az';
  const w = Math.max(16, Math.round(size));
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      width={w}
      height={Math.round(w * 0.75)}
      alt=""
      aria-hidden
      className={`shrink-0 rounded-md object-cover shadow-sm ring-1 ring-white/10 ${className}`}
      loading="lazy"
    />
  );
}

export default QrFlagIcon;
