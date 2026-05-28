import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiCalendar,
  FiLayers,
  FiMoreVertical,
  FiFileText,
  FiList,
  FiShoppingBag,
} from 'react-icons/fi';
import api from '../../api/axios';
import { extractCustomPaymentTotals } from '../../utils/reportCustomPaymentTotals';
import { reconcileShiftPaymentDisplay } from '../../utils/reportPaymentDisplay';

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId;

  const fetchShifts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await api.get('/Reports/all-shifts', {
        params: { page: currentPage, pageSize: pageSize, companyId: companyId }
      });
      
      const data = response.data;
      setShifts(data.items || []); 
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error("Xəta:", err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, companyId]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left font-sans">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Növbə Hesabatları</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Kassa növbələrinin tam tarixçəsi</p>
        </div>
        <div className="hidden md:block">
           <span className="px-4 py-2 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">Cəmi: {totalCount}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-40 gap-4 bg-white rounded-[40px] shadow-sm">
          <div className="w-12 h-12 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <ShiftCard key={shift.shiftId ?? shift.ShiftId ?? shift.id ?? shift.Id} shift={shift} />
            ))
          ) : (
            <div className="bg-white p-24 rounded-[40px] text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Məlumat yoxdur.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 pb-10">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20"><FiChevronLeft/></button>
              <div className="px-8 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm font-black text-[11px] uppercase tracking-widest min-w-[160px] text-center">Səhifə {currentPage} / {totalPages}</div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20"><FiChevronRight/></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CUSTOM_STAT_COLORS = [
  'text-indigo-600',
  'text-rose-600',
  'text-violet-600',
  'text-sky-600',
];

const ShiftCard = ({ shift }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const shiftId = shift.shiftId ?? shift.ShiftId ?? shift.id ?? shift.Id;
  const shiftDateLabel = shift.startTime ? moment.utc(shift.startTime).format('DD.MM.YYYY HH:mm') : '';

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const go = (path) => {
    setMenuOpen(false);
    if (!shiftId) return;
    const q = new URLSearchParams({ shiftId: String(shiftId) });
    if (shiftDateLabel) q.set('shiftLabel', shiftDateLabel);
    navigate(`${path}?${q.toString()}`);
  };

  const payGross = reconcileShiftPaymentDisplay(shift);
  const cash = payGross.cash;
  const card = payGross.card;
  const revenue = shift.totalRevenue ?? shift.TotalRevenue ?? 0;
  const orders = shift.orderCount ?? shift.OrderCount ?? 0;
  const openingDep = Number(shift.openingDepositAmount ?? shift.OpeningDepositAmount ?? 0) || 0;
  const customPayRows = useMemo(() => extractCustomPaymentTotals(shift), [shift]);

  const startMoment = shift.startTime ? moment.utc(shift.startTime) : null;
  const endMoment = shift.endTime ? moment.utc(shift.endTime) : null;

  const formatShiftTime = (m, showDateIfDifferentFromStart = false) => {
    if (!m) return '—';
    if (showDateIfDifferentFromStart && startMoment) {
      const sameDay = m.format('YYYY-MM-DD') === startMoment.format('YYYY-MM-DD');
      return sameDay ? m.format('HH:mm') : m.format('DD.MM.YYYY HH:mm');
    }
    return m.format('HH:mm');
  };

  return (
    <div
      className={`bg-white rounded-[35px] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative ${
        menuOpen ? 'z-[80] ring-2 ring-[#0ea5e9]/15 shadow-lg' : ''
      }`}
    >
      <div ref={menuRef} className="absolute right-4 top-4 z-[100] xl:right-6 xl:top-6">
        <button
          type="button"
          aria-label="Növbə əməliyyatları"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm transition-all ${
            menuOpen
              ? 'border-[#0ea5e9]/40 text-[#0ea5e9] ring-2 ring-[#0ea5e9]/25'
              : 'border-slate-200 hover:border-[#0ea5e9]/35 hover:bg-slate-50 hover:text-[#0ea5e9]'
          }`}
        >
          <FiMoreVertical size={18} strokeWidth={2.25} />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 w-[min(17rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-slate-200/90 bg-white py-1.5 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50 active:bg-slate-100"
              onClick={() => go('/boss/checks')}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <FiFileText size={16} />
              </span>
              <span className="leading-snug">Çeklər</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50 active:bg-slate-100"
              onClick={() => go('/boss/audit-logs')}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <FiList size={16} />
              </span>
              <span className="leading-snug">Hərəkət tarixçəsi</span>
            </button>
            <div className="mx-2 my-1 h-px bg-slate-100" aria-hidden />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50 active:bg-slate-100"
              onClick={() => go('/boss/shift-expenses')}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <FiShoppingBag size={16} />
              </span>
              <span className="leading-snug">Daxili xərclər</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10 pr-12 xl:pr-14">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-slate-50 rounded-[22px] flex items-center justify-center text-slate-400 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-500 shadow-inner">
            <FiCalendar size={28} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3 mb-2">
              {/* 🔥 moment.utc() istifadə edirik ki, 4 saat artırmasın */}
              <span className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">
                {moment.utc(shift.startTime).format('DD.MM.YYYY')}
              </span>
              {/* <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${shift.isClosed ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse'}`}>
                {shift.isClosed ? 'Qapalı' : 'Aktiv'}
              </span> */}
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-[11px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-2 text-gray-400">
                <FiClock size={14} className="text-slate-300"/>
                {/* 🔥 Burada da moment.utc() */}
                <span>Açılış: <span className="text-slate-600 font-black">{moment.utc(shift.startTime).format('HH:mm')}</span></span>
              </div>
              {shift.endTime && (
                <div className="flex items-center gap-2 text-gray-400">
                  <FiClock size={14} className="text-rose-300"/>
                  {/* 🔥 Burada da moment.utc() */}
                  <span>
                    Bağlanış:{' '}
                    <span className="text-rose-500 font-black">
                      {formatShiftTime(endMoment, true)}
                    </span>
                  </span>
                </div>
              )}
            </div>
            {openingDep > 0 ? (
              <p className="mt-2 text-sm font-black text-indigo-700">
                Depozit: {openingDep.toFixed(2)} ₼
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-x-8 gap-y-6 pt-8 xl:pt-0 border-t xl:border-t-0 border-gray-50 xl:justify-end">
          <StatMini label="Nağd" value={cash} color="text-emerald-600" icon={<FiDollarSign />} />
          <StatMini label="Kart" value={card} color="text-amber-500" icon={<FiCreditCard />} />
          {customPayRows.map((row, i) => (
            <StatMini
              key={`${row.name}-${i}`}
              label={row.name}
              value={row.amount}
              color={CUSTOM_STAT_COLORS[i % CUSTOM_STAT_COLORS.length]}
              icon={<FiLayers />}
            />
          ))}
          <StatMini label="Sifariş" value={orders} color="text-purple-600" icon={<FiActivity />} isPrice={false} />
          <div className="text-right flex flex-col justify-center min-w-[120px] bg-slate-50/50 p-4 rounded-3xl border border-gray-50 shrink-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Yekun Gəlir</p>
            <p className="text-2xl font-black text-[#0ea5e9] tracking-tighter italic font-sans">{(revenue || 0).toFixed(2)} ₼</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, color, icon, isPrice = true }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-lg ${color}`}>{icon}</div>
    <div className="text-left">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={`text-sm font-black italic tracking-tight ${color} font-sans`}>{isPrice ? `${(value || 0).toFixed(2)} ₼` : (value || 0)}</p>
    </div>
  </div>
);

export default ShiftsPage;