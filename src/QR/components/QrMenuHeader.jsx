import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { qrT } from '../i18n/qrLocales';
import { qrLocalizedName } from '../utils/qrLocalizedFields';
import { mediaUrl } from '../../utils/mediaUrl';

export default function QrMenuHeader({ company, settings, lang, onSearchClick }) {
  const displayName = qrLocalizedName(company, lang) || company?.name || '';
  const logoPath = company?.logo || company?.Logo || settings?.logo || settings?.Logo || '';
  const logoUrl = mediaUrl(logoPath);
  const serviceCharge = Number(settings?.serviceChargePercent ?? settings?.ServiceChargePercent ?? 0);

  return (
    <div className="bg-[#f2f2f7] px-4 pb-3 pt-4 transition-colors dark:bg-black">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-gray-200 dark:bg-[#1C1C1E] dark:ring-white/10">
          {logoUrl ? (
            <img src={logoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-black uppercase text-[#38bdf8]">
              {displayName.charAt(0) || '?'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight text-gray-900 dark:text-white">
            {displayName}
          </h1>
          {serviceCharge > 0 ? (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#8E8E93]">
              {qrT(lang, 'serviceFeeLabel')}: {serviceCharge}%
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onSearchClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1C1C1E] text-[#38bdf8] transition active:scale-95 dark:bg-[#2C2C2E]"
          aria-label={qrT(lang, 'search')}
        >
          <FiSearch size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
