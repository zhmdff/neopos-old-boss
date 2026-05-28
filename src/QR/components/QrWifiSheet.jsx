import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import QrBottomSheet from './QrBottomSheet';
import { qrT, wifiQrPayload } from '../i18n/qrLocales';

export default function QrWifiSheet({ open, onClose, settings, lang }) {
  const ssid = settings?.wifiName || settings?.WifiName || 'Guest';
  const password = settings?.wifiPassword || settings?.WifiPassword || '';
  const qrValue = wifiQrPayload(ssid, password);

  const copy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${qrT(lang, 'copied')}`, {
      style: { borderRadius: '12px', background: '#1C1C1E', color: '#fff' },
    });
  };

  return (
    <QrBottomSheet open={open} onClose={onClose} title={qrT(lang, 'wifiTitle')}>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-lg">
          <QRCodeSVG value={qrValue} size={200} level="M" includeMargin />
        </div>
        <p className="text-center text-xs font-medium text-gray-500 dark:text-[#8E8E93]">{qrT(lang, 'wifiScanHint')}</p>

        <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#1C1C1E]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 dark:border-white/10">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-[#8E8E93]">{qrT(lang, 'name')}</p>
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{ssid}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(ssid, qrT(lang, 'name'))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 transition active:scale-95 dark:bg-black dark:text-white/70 dark:ring-0"
            >
              <FiCopy size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-[#8E8E93]">{qrT(lang, 'password')}</p>
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{password || '—'}</p>
            </div>
            {password ? (
              <button
                type="button"
                onClick={() => copy(password, qrT(lang, 'password'))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 transition active:scale-95 dark:bg-black dark:text-white/70 dark:ring-0"
              >
                <FiCopy size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </QrBottomSheet>
  );
}
