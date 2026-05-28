import React from 'react';
import { FiClock } from 'react-icons/fi';

/** Masa saat limiti: 3:00, 1:30 */
const TableHourLimitField = ({ value, onChange, required = true }) => (
  <div>
    <label className="mb-2 ml-1 flex items-center gap-2 text-xs font-black uppercase text-gray-400">
      <FiClock size={12} className="text-amber-600" /> Masa limiti (saat:dəqiqə)
    </label>
    <input
      type="text"
      inputMode="numeric"
      required={required}
      placeholder="3:00"
      className="w-full rounded-2xl border border-amber-100 bg-amber-50/60 px-6 py-4 font-black text-gray-800 outline-none focus:ring-2 focus:ring-amber-400"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
      Məs: 3:00 (3 saat), 1:30 (1 saat 30 dəq)
    </p>
  </div>
);

export default TableHourLimitField;
