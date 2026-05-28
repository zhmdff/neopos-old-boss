import React from 'react';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';

const ranges = [
  { id: 'today', label: 'Bu gün' },
  { id: 'week', label: 'Bu həftə' },
  { id: 'month', label: 'Bu ay' },
  { id: 'year', label: 'Bu il' },
];

export default function ReportRangeBar({
  start,
  end,
  activeRange,
  onChange,
  includeOpenTables,
  onToggleIncludeOpen,
  showShiftRange = false,
}) {
  const setQuickRange = (type) => {
    const today = new Date();
    if (type === 'shift') {
      onChange({ activeRange: 'shift' });
      return;
    }
    let s = today;
    if (type === 'week') s = startOfWeek(today, { weekStartsOn: 1 });
    if (type === 'month') s = startOfMonth(today);
    if (type === 'year') s = startOfYear(today);
    onChange({
      start: format(s, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
      activeRange: type,
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-white p-1.5 rounded-[22px] shadow-sm border border-gray-100 flex gap-1 overflow-x-auto no-scrollbar">
          {showShiftRange ? (
            <button
              type="button"
              onClick={() => setQuickRange('shift')}
              className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase transition-all whitespace-nowrap ${
                activeRange === 'shift'
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  : 'hover:bg-gray-50 text-slate-500'
              }`}
            >
              Cari növbə
            </button>
          ) : null}
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setQuickRange(r.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${
                activeRange === r.id
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  : 'hover:bg-gray-50 text-slate-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <FiCalendar className="text-slate-300" />
            <input
              type="date"
              value={start}
              onChange={(e) => onChange({ start: e.target.value, end, activeRange: 'custom' })}
              className="bg-transparent text-[11px] font-black text-slate-700 outline-none"
            />
            <span className="text-slate-300 font-black">—</span>
            <input
              type="date"
              value={end}
              onChange={(e) => onChange({ start, end: e.target.value, activeRange: 'custom' })}
              className="bg-transparent text-[11px] font-black text-slate-700 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm select-none">
            <input
              type="checkbox"
              checked={includeOpenTables}
              onChange={(e) => onToggleIncludeOpen?.(e.target.checked)}
              className="h-5 w-5 accent-[#0ea5e9]"
            />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-600">
              Açıq masaları əlavə et
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

