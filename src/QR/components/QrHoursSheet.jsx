import React from 'react';
import QrBottomSheet from './QrBottomSheet';
import { dayLabelForLang, qrT } from '../i18n/qrLocales';

export default function QrHoursSheet({ open, onClose, lang, workingHours }) {
  const hours = String(workingHours || '09:00 - 23:00').trim() || '09:00 - 23:00';
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <QrBottomSheet open={open} onClose={onClose} title={qrT(lang, 'hoursTitle')}>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
        {Array.from({ length: 7 }, (_, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between border-b border-gray-100 px-4 py-3.5 last:border-b-0 dark:border-white/5 ${
              idx === todayIdx ? 'bg-sky-50 dark:bg-white/[0.03]' : ''
            }`}
          >
            <span
              className={`text-sm font-semibold ${idx === todayIdx ? 'text-sky-600 dark:text-[#38bdf8]' : 'text-gray-900 dark:text-white'}`}
            >
              {dayLabelForLang(lang, idx)}
            </span>
            <span
              className={`text-sm font-bold tabular-nums ${idx === todayIdx ? 'text-sky-600 dark:text-[#38bdf8]' : 'text-gray-700 dark:text-white/90'}`}
            >
              {hours}
            </span>
          </div>
        ))}
      </div>
    </QrBottomSheet>
  );
}
