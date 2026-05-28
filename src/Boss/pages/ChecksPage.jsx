import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChecksTable from '../components/Checks/ChecksTable';
import CheckDetailModal from '../components/Checks/CheckDetailModal';
import api from '../../api/axios';
import { format, startOfMonth } from 'date-fns';
import { FiCalendar, FiFilter, FiRefreshCw, FiX } from 'react-icons/fi';

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ChecksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pinnedShiftId = useMemo(() => {
    const raw = searchParams.get('shiftId');
    if (!raw || !GUID_RE.test(String(raw).trim())) return '';
    return String(raw).trim();
  }, [searchParams]);
  const pinnedShiftLabel = useMemo(() => {
    try {
      return decodeURIComponent(searchParams.get('shiftLabel') || '').trim();
    } catch {
      return (searchParams.get('shiftLabel') || '').trim();
    }
  }, [searchParams]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId;

  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeRange, setActiveRange] = useState('shift');
  const [isGuestModeActive, setIsGuestModeActive] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    api
      .get(`/Companies/${companyId}`)
      .then((res) => {
        if (cancelled) return;
        const v = res.data?.isGuestModeActive ?? res.data?.IsGuestModeActive;
        setIsGuestModeActive(!!v);
      })
      .catch(() => {
        if (!cancelled) setIsGuestModeActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const applyShiftRange = useCallback(async () => {
    const today = new Date();
    try {
      if (!companyId) throw new Error('no company');
      const sr = await api.get(`/CashShifts/active/${companyId}`);
      const d = sr.data || null;
      const st = d?.startTime ?? d?.StartTime ?? d?.openTime ?? d?.OpenTime ?? null;
      const s = st ? new Date(st) : today;
      setStartDate(format(s, 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    } catch {
      // fallback: bu gün
      setStartDate(format(today, 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    }
  }, [companyId]);

  const handleRangeChange = useCallback((range) => {
    if (pinnedShiftId) setSearchParams({}, { replace: true });
    setActiveRange(range);
    const today = new Date();
    switch (range) {
      case 'shift':
        void applyShiftRange();
        break;
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      default:
        break;
    }
  }, [applyShiftRange, pinnedShiftId, setSearchParams]);

  const fetchChecks = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      if (pinnedShiftId) {
        const response = await api.get('/Orders/closed-orders', {
          params: { companyId, cashShiftId: pinnedShiftId, page: 1, pageSize: 1000 },
        });
        const body = response.data || {};
        setOrders(body.orders || body.Orders || []);
      } else if (activeRange === 'shift') {
        const response = await api.get(`/CashShifts/active-shift-orders/${companyId}`, {
          params: { page: 1, pageSize: 1000 },
        });
        const body = response.data || {};
        setOrders(body.orders || body.Orders || []);
      } else {
        const response = await api.get('/Orders/closed-orders', {
          params: { startDate, endDate, companyId, page: 1, pageSize: 1000 },
        });
        const body = response.data || {};
        setOrders(body.orders || body.Orders || []);
      }
    } catch (err) {
      console.error("Məlumat yüklənərkən xəta:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, companyId, activeRange, pinnedShiftId]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  useEffect(() => {
    if (pinnedShiftId) return;
    if (activeRange !== 'shift') return;
    void applyShiftRange();
  }, [activeRange, applyShiftRange, pinnedShiftId]);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left font-sans">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Sifariş Tarixçəsi
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Bağlanmış çeklər və tarix filtri
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <button
            type="button"
            onClick={() => void fetchChecks()}
            disabled={loading}
            title="Siyahını yenilə"
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all bg-white text-emerald-800 border border-emerald-100 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-45"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Yenilə
          </button>
          {/* Range Seçimi */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-[24px] shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
            {['shift', 'today', 'month', 'custom'].map((r) => (
              <RangeButton 
                key={r} 
                label={r === 'shift' ? 'Cari növbə' : r === 'today' ? 'Bu gün' : r === 'month' ? 'Bu ay' : 'Aralıq'} 
                active={activeRange === r} 
                onClick={() => handleRangeChange(r)} 
              />
            ))}
          </div>
        </div>
      </div>

      {pinnedShiftId ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-indigo-900">
            Növbə üzrə çeklər
            {pinnedShiftLabel ? (
              <span className="ml-2 font-bold normal-case text-indigo-700">· {pinnedShiftLabel}</span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-indigo-100 hover:border-[#0ea5e9]/40"
          >
            <FiX size={14} />
            Bağla
          </button>
        </div>
      ) : null}

      {/* DATE PICKERS */}
      <div
        className={`mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-[28px] shadow-sm border border-gray-100 w-full sm:w-fit ${
          pinnedShiftId ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100">
          <FiCalendar className="text-[#0ea5e9] shrink-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase italic whitespace-nowrap">Başlanğıc:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setActiveRange('custom');
            }}
            disabled={!!pinnedShiftId}
            className="font-black text-xs outline-none bg-transparent w-full"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2">
          <FiCalendar className="text-[#0ea5e9] shrink-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase italic whitespace-nowrap">Son Tarix:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActiveRange('custom');
            }}
            disabled={!!pinnedShiftId}
            className="font-black text-xs outline-none bg-transparent w-full"
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-40 gap-4 bg-white rounded-[40px] shadow-sm border border-gray-50">
          <div className="w-12 h-12 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin"></div>
          <p className="font-black text-gray-300 uppercase tracking-[0.3em] text-[10px]">Məlumatlar yüklənir...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
          {orders?.length > 0 ? (
            <ChecksTable
              checks={orders}
              showGuestColumn={isGuestModeActive}
              onDetailClick={(check) => setSelectedCheck(check)}
            />
          ) : (
            <div className="py-32 text-center">
              <FiFilter className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Seçilmiş tarixdə məlumat tapılmadı</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {selectedCheck && (
        <CheckDetailModal
          check={selectedCheck}
          showGuestDetail={isGuestModeActive}
          onClose={() => setSelectedCheck(null)}
        />
      )}
    </div>
  );
};

// YARDIMÇI KOMPONENTLƏR
const RangeButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
      active ? 'bg-[#0ea5e9] text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export default ChecksPage;