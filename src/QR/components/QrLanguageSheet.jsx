import React from 'react';
import { FiCheck } from 'react-icons/fi';
import QrBottomSheet from './QrBottomSheet';
import QrFlagIcon from './QrFlagIcon';
import { QR_LANGS, qrT } from '../i18n/qrLocales';

export default function QrLanguageSheet({ open, onClose, lang, onSelect }) {
  return (
    <QrBottomSheet open={open} onClose={onClose} title={qrT(lang, 'languageTitle')}>
      <div className="space-y-2 pb-2">
        {QR_LANGS.map((item) => {
          const active = lang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                onSelect?.(item.code);
                onClose?.();
              }}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition active:scale-[0.99] ${
                active
                  ? 'bg-teal-50 ring-1 ring-[#2DD4BF]/50 dark:bg-[#134e4a]/90'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-[#1C1C1E] dark:hover:bg-[#252528]'
              }`}
            >
              <div className="flex items-center gap-3">
                <QrFlagIcon langCode={item.code} size={36} />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
              </div>
              {active ? <FiCheck className="text-teal-600 dark:text-[#2DD4BF]" size={22} strokeWidth={2.5} /> : null}
            </button>
          );
        })}
      </div>
    </QrBottomSheet>
  );
}
