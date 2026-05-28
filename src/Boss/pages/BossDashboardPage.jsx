import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import {
  FiTrendingUp,
  FiDollarSign,
  FiCreditCard,
  FiHash,
  FiUsers,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiActivity,
  FiAlertTriangle,
  FiRefreshCw,
  FiLayers,
} from 'react-icons/fi';
import api from '../../api/axios';
import { extractCustomPaymentTotals } from '../../utils/reportCustomPaymentTotals';
import { reconcileShiftPaymentDisplay } from '../../utils/reportPaymentDisplay';

function money(x) {
  const n = Number(x || 0);
  return `${n.toFixed(2)} ₼`;
}

function pickSummaryNum(summary, camel, pascal) {
  const v = summary?.[camel] ?? summary?.[pascal];
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const ranges = [
  { id: 'shift', label: 'Cari növbə' },
  { id: 'today', label: 'Bu gün' },
  { id: 'week', label: 'Bu həftə' },
  { id: 'month', label: 'Bu ay' },
  { id: 'year', label: 'Bu il' },
];

function pickShiftId(shift) {
  return shift?.id ?? shift?.Id ?? shift?.shiftId ?? shift?.ShiftId ?? '';
}

function pickShiftStart(shift) {
  return shift?.startTime ?? shift?.StartTime ?? shift?.openTime ?? shift?.OpenTime ?? null;
}

function pickShiftEnd(shift) {
  return shift?.endTime ?? shift?.EndTime ?? null;
}

function formatShiftDateDot(shift) {
  const st = pickShiftStart(shift);
  if (!st) return '—';
  try {
    return format(new Date(st), 'dd.MM.yyyy');
  } catch {
    return String(st).slice(0, 10);
  }
}

function isShiftOpen(shift) {
  const closed = shift?.isClosed ?? shift?.IsClosed;
  if (typeof closed === 'boolean') return !closed;
  return !pickShiftEnd(shift);
}

function auditTone(actionRaw) {
  const a = String(actionRaw || '').toUpperCase();
  if (a.includes('SİL') || a.includes('SIL')) return 'danger';
  if (a.includes('REDAKT') || a.includes('DƏYİŞ') || a.includes('DEYIS')) return 'warn';
  if (a.includes('ƏLAV') || a.includes('ELAV')) return 'success';
  if (a.includes('BAĞLANDI') || a.includes('BAGLANDI')) return 'info';
  return 'neutral';
}

function toneClasses(tone) {
  if (tone === 'danger') return 'bg-rose-50 border-rose-100 text-rose-700';
  if (tone === 'warn') return 'bg-amber-50 border-amber-100 text-amber-700';
  if (tone === 'success') return 'bg-emerald-50 border-emerald-100 text-emerald-700';
  if (tone === 'info') return 'bg-indigo-50 border-indigo-100 text-indigo-700';
  return 'bg-slate-50 border-slate-100 text-slate-700';
}

export default function BossDashboardPage() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const companyId = user?.companyId;

  const [activeRange, setActiveRange] = useState('shift');
  const [start, setStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeOpenTables, setIncludeOpenTables] = useState(false);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState(null);
  const [waiters, setWaiters] = useState(null);
  const [audit, setAudit] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [activeShift, setActiveShift] = useState(null);

  const payDisplay = useMemo(
    () => (summary ? reconcileShiftPaymentDisplay(summary) : { cash: 0, card: 0 }),
    [summary],
  );

  const salesBreakdown = useMemo(() => {
    if (!summary) {
      return {
        total: 0,
        closed: 0,
        open: 0,
        closedCount: 0,
        openCount: 0,
      };
    }
    const total = pickSummaryNum(summary, 'totalRevenue', 'TotalRevenue');
    const closed = pickSummaryNum(summary, 'closedRevenue', 'ClosedRevenue');
    const open = pickSummaryNum(summary, 'openRevenueAdded', 'OpenRevenueAdded');
    const closedCount = pickSummaryNum(summary, 'closedOrderCount', 'ClosedOrderCount');
    const openCount = pickSummaryNum(summary, 'openOrderCount', 'OpenOrderCount');
    return {
      total,
      closed: closed || total - open,
      open,
      closedCount: closedCount || pickSummaryNum(summary, 'orderCount', 'OrderCount'),
      openCount,
    };
  }, [summary]);

  const setQuickRange = (type) => {
    const today = new Date();
    if (type === 'shift') {
      setActiveRange(type);
      // tarixləri fetchAll içində aktiv növbəyə görə quracağıq
      setStart(format(today, 'yyyy-MM-dd'));
      setEnd(format(today, 'yyyy-MM-dd'));
      return;
    }
    let s = today;
    if (type === 'week') s = startOfWeek(today, { weekStartsOn: 1 });
    if (type === 'month') s = startOfMonth(today);
    if (type === 'year') s = startOfYear(today);
    setActiveRange(type);
    setStart(format(s, 'yyyy-MM-dd'));
    setEnd(format(today, 'yyyy-MM-dd'));
  };

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const cacheKey = `dashboard_${companyId}_${activeRange}_${start}_${end}_${includeOpenTables}`;

    if (!navigator.onLine) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setSummary(data.summary);
          setTables(data.tables);
          setWaiters(data.waiters);
          setShifts(data.shifts);
          setAudit(data.audit);
          setActiveShift(data.activeShift);
          setLoading(false);
          return;
        } catch (e) {
          console.error('[Dashboard] Error parsing cache:', e);
        }
      }
    }

    try {
      // Cari növbə: CashShift startTime götürüb start/end qururuq (ən azı tarix səviyyəsində).
      let effectiveStart = start;
      let effectiveEnd = end;
      let shiftObj = null;
      if (activeRange === 'shift') {
        try {
          const sr = await api.get(`/CashShifts/active/${companyId}`);
          shiftObj = sr.data || null;
          setActiveShift(shiftObj);
          const st =
            shiftObj?.startTime ?? shiftObj?.StartTime ?? shiftObj?.openTime ?? shiftObj?.OpenTime ?? null;
          if (st) {
            effectiveStart = format(new Date(st), 'yyyy-MM-dd');
          }
          effectiveEnd = format(new Date(), 'yyyy-MM-dd');
        } catch {
          setActiveShift(null);
          // fallback: bu gün
          effectiveStart = format(new Date(), 'yyyy-MM-dd');
          effectiveEnd = format(new Date(), 'yyyy-MM-dd');
        }
      }

      const summaryPromise =
        activeRange === 'shift' && pickShiftId(shiftObj)
          ? api.get(`/Reports/shift/${pickShiftId(shiftObj)}`, {
              params: { companyId, includeOpenTables },
            })
          : api.get('/Reports/summary', {
              params: { companyId, start: effectiveStart, end: effectiveEnd, includeOpenTables },
            });

      const [sumRes, tRes, wRes, shiftsRes, auditRes] = await Promise.all([
        summaryPromise,
        api.get('/Reports/by-table', {
          params: { companyId, start: effectiveStart, end: effectiveEnd, includeOpenTables },
        }),
        api.get('/Reports/by-waiter', {
          params: { companyId, start: effectiveStart, end: effectiveEnd, includeOpenTables },
        }),
        api.get('/Reports/all-shifts', {
          params: { page: 1, pageSize: 5, companyId },
        }),
        api.get(`/AuditLogs`, {
          params: { companyId, take: 10 },
        }),
      ]);
      setSummary(sumRes.data);
      setTables(tRes.data);
      setWaiters(wRes.data);
      setShifts(shiftsRes.data?.items || shiftsRes.data?.Items || []);
      setAudit(Array.isArray(auditRes.data) ? auditRes.data : []);

      // Cache the successful result
      localStorage.setItem(cacheKey, JSON.stringify({
        summary: sumRes.data,
        tables: tRes.data,
        waiters: wRes.data,
        shifts: shiftsRes.data?.items || shiftsRes.data?.Items || [],
        audit: Array.isArray(auditRes.data) ? auditRes.data : [],
        activeShift: shiftObj
      }));

    } catch (e) {
      console.error(e);
      // Fallback to cache on error if available
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setSummary(data.summary);
          setTables(data.tables);
          setWaiters(data.waiters);
          setShifts(data.shifts);
          setAudit(data.audit);
          setActiveShift(data.activeShift);
        } catch {
          setSummary(null);
          setTables(null);
          setWaiters(null);
          setShifts([]);
          setAudit([]);
          setActiveShift(null);
        }
      } else {
        setSummary(null);
        setTables(null);
        setWaiters(null);
        setShifts([]);
        setAudit([]);
        setActiveShift(null);
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, start, end, includeOpenTables, activeRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const topTables = (tables?.items || tables?.Items || []).slice(0, 6);
  const topWaiters = (waiters?.items || waiters?.Items || []).slice(0, 6);
  const activeShiftId = pickShiftId(activeShift);

  /** «Cari növbə» seçilib, amma aktiv açıq növbə yoxdur və ya bağlıdır — rəqəmlər növbə üzrə deyil. */
  const shiftRangeButNoLiveShift =
    activeRange === 'shift' &&
    (!activeShift || !String(pickShiftId(activeShift) || '').trim() || !isShiftOpen(activeShift));

  return (
    <div className="p-3 sm:p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left font-sans">
      <div className="mb-4 md:mb-10 flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void fetchAll()}
            disabled={loading}
            title="Məlumatları yenilə"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-slate-700 font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] disabled:opacity-45 shrink-0 transition-all"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Yenilə
          </button>
        </div>

        <div className="bg-white p-1.5 rounded-[22px] shadow-sm border border-gray-100 flex gap-1 overflow-x-auto no-scrollbar">
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setQuickRange(r.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeRange === r.id
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  : 'hover:bg-gray-50 text-slate-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {!loading && shiftRangeButNoLiveShift && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm">
            <FiAlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wide text-amber-800">
                Hal-hazırda növbə bağlıdır
              </p>
              <p className="text-xs font-bold text-amber-900/90 leading-snug">
                Açıq kassa növbəsi olmadığı üçün «Cari növbə» rejimində göstərilən rəqəmlər aktiv növbəyə görə hesablanmır;
                tarix sahələri üzrə ümumi xülasə göstərilir. Növbə açılandan sonra bu filtr yenidən cari növbəni əks etdirəcək.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <FiCalendar className="text-slate-300" />
            <input
              type="date"
              value={start}
              onChange={(e) => {
                setActiveRange('custom');
                setStart(e.target.value);
              }}
              className="bg-transparent text-[11px] font-black text-slate-700 outline-none"
            />
            <span className="text-slate-300 font-black">—</span>
            <input
              type="date"
              value={end}
              onChange={(e) => {
                setActiveRange('custom');
                setEnd(e.target.value);
              }}
              className="bg-transparent text-[11px] font-black text-slate-700 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm select-none">
            <input
              type="checkbox"
              checked={includeOpenTables}
              onChange={(e) => setIncludeOpenTables(e.target.checked)}
              className="h-5 w-5 accent-[#0ea5e9]"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Açıq masaları əlavə et
            </span>
          </label>
        </div>

        {/* Cari növbənin açılışı UI-da göstərilmir (tələbə görə). */}
      </div>

      {loading ? (
        <div className="py-40 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">
          Yüklənir...
        </div>
      ) : !summary ? (
        <div className="bg-white p-20 rounded-[40px] text-center border border-dashed border-gray-200">
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Məlumat yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Statlar: telefon üçün oxunaqlı — hamısı alt-alta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <RevenueMiniStat
              title="Ümumi satış"
              value={money(salesBreakdown.total)}
              icon={<FiTrendingUp />}
              color="text-blue-600"
              bg="bg-sky-50"
              showBreakdown={includeOpenTables}
              breakdown={salesBreakdown}
            />
            {includeOpenTables ? (
              <MiniStat
                title="Açıq çeklər cəmi"
                value={money(salesBreakdown.open)}
                subtitle={
                  salesBreakdown.openCount > 0
                    ? `${salesBreakdown.openCount} açıq çek`
                    : 'Açıq çek yoxdur'
                }
                icon={<FiActivity />}
                color="text-amber-600"
                bg="bg-amber-50"
              />
            ) : null}
            <MiniStat
              title="Sifariş sayı"
              value={String(
                includeOpenTables
                  ? salesBreakdown.closedCount + salesBreakdown.openCount
                  : salesBreakdown.closedCount || pickSummaryNum(summary, 'orderCount', 'OrderCount'),
              )}
              icon={<FiHash />}
              color="text-purple-600"
              bg="bg-purple-50"
              isMoney={false}
              subtitle={
                includeOpenTables && salesBreakdown.openCount > 0
                  ? `${salesBreakdown.closedCount} bağlı · ${salesBreakdown.openCount} açıq`
                  : ''
              }
            />
            <CashCardStack
              cash={payDisplay.cash}
              card={payDisplay.card}
              customRows={extractCustomPaymentTotals(summary)}
            />
          </div>

          {/* 1) Son növbələr */}
          <div className="grid grid-cols-1 gap-6">
            <SimpleList
              title="Son növbə tarixçəsi"
              subtitle="Son 5"
              empty="Növbə yoxdur"
              moreLabel="Hamısını gör"
              onMore={() => navigate('/boss/shifts')}
              items={(shifts || []).slice(0, 5).map((s, idx) => {
                const id = pickShiftId(s) || idx;
                const open = isShiftOpen(s);
                const isActive = open && (activeShiftId ? String(id) === String(activeShiftId) : true);
                // Növbə Hesabatları ilə eyni: birbaşa /Reports/all-shifts dəyərləri.
                const revenue = s.totalRevenue ?? s.TotalRevenue ?? 0;
                return {
                  key: id,
                  left: formatShiftDateDot(s),
                  right: money(revenue),
                  tone: isActive ? 'success-strong' : 'neutral',
                  sub: open ? 'HAL HAZIRDA AÇIQ' : '',
                };
              })}
              renderItem={(x, i) => {
                const isActive = x.tone === 'success-strong';
                return (
                  <div
                    key={x.key || i}
                    className={[
                      'px-4 py-3 rounded-2xl border',
                      isActive
                        ? 'bg-emerald-950 border-emerald-900 text-white'
                        : i % 2 === 0
                          ? 'bg-white border-transparent'
                          : 'bg-slate-50/70 border-transparent',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`${isActive ? 'text-[12px] font-black' : 'text-[11px] font-black text-slate-700'} truncate`}>
                        {x.left}
                      </p>
                      <p className={`${isActive ? 'text-[13px] font-black' : 'text-[11px] font-black text-slate-900'} shrink-0`}>
                        {x.right}
                      </p>
                    </div>
                    {x.sub ? (
                      <p className={`${isActive ? 'text-[10px] font-black text-emerald-200' : 'text-[10px] font-bold text-slate-400'} mt-1 uppercase tracking-widest`}>
                        {x.sub}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />
          </div>

          {/* 2) Top masalar */}
          <div className="grid grid-cols-1 gap-6">
            <TopList
              title="Top masalar"
              subtitle="Dövriyyəyə görə"
              items={topTables.map((t) => ({
                key: t.tableId || t.TableId,
                left: `${t.hallName || t.HallName || 'Zal'} · ${t.tableName || t.TableName || 'Masa'}`,
                right: money(t.revenue || t.Revenue),
              }))}
            />
          </div>

          {/* 3) Top ofisiantlar */}
          <div className="grid grid-cols-1 gap-6">
            <TopList
              title="Top ofisiantlar"
              subtitle="Dövriyyəyə görə"
              items={topWaiters.map((w) => ({
                key: w.waiterName || w.WaiterName,
                left: w.waiterName || w.WaiterName || '—',
                right: money(w.revenue || w.Revenue),
              }))}
            />
          </div>

          {/* 4) Hərəkət tarixçəsi */}
          <div className="grid grid-cols-1 gap-6">
            <SimpleList
              title="Hərəkət tarixçəsi"
              subtitle="Son 10"
              empty="Log yoxdur"
              moreLabel="Aç"
              onMore={() => navigate('/boss/audit-logs')}
              items={(audit || []).slice(0, 10).map((l, idx) => {
                const act = String(l.action || '').toUpperCase();
                const tone = auditTone(act);
                const tableName = String(l.tableName || '').trim()
                  ? String(l.tableName).toUpperCase()
                  : '—';
                return {
                  key: l.id || idx,
                  left: `${l.userName || '—'}`,
                  right: tableName,
                  sub: String(l.description || '').slice(0, 160),
                  badge: act || '—',
                  tone,
                };
              })}
              renderItem={(x, i) => (
                <div
                  key={x.key || i}
                  className={`px-4 py-3 rounded-2xl ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black text-slate-700 truncate">{x.left}</p>
                    <p className="text-[11px] font-black text-slate-900 shrink-0">{x.right}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${toneClasses(x.tone)}`}
                    >
                      {x.badge}
                    </span>
                    {x.sub ? (
                      <span className="text-[10px] font-bold text-slate-400 leading-snug line-clamp-3">
                        {x.sub}
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ title, value, icon, color, bg, isMoney = true, subtitle = '' }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-[30px] sm:rounded-[35px] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-visible">
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${bg} opacity-40 rounded-full group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-4 ${bg} ${color} rounded-2xl text-2xl shadow-sm`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter truncate">{value}</h3>
          {subtitle ? (
            <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RevenueMiniStat({ title, value, icon, color, bg, showBreakdown, breakdown }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-[30px] sm:rounded-[35px] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-visible">
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${bg} opacity-40 rounded-full group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-4 ${bg} ${color} rounded-2xl text-2xl shadow-sm`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter truncate">{value}</h3>
          {showBreakdown ? (
            <p className="mt-1 text-[10px] font-bold text-sky-600 uppercase tracking-wide">
              Üzərinə gəl · cəmi
            </p>
          ) : null}
        </div>
      </div>

      {showBreakdown ? (
        <div className="pointer-events-none absolute left-4 right-4 top-full z-30 mt-2 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl group-hover:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Satış cəmi</p>
          <div className="space-y-2 text-[11px] font-bold text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <span>Bağlı çeklər</span>
              <span className="text-slate-900">
                {money(breakdown.closed)} · {breakdown.closedCount} çek
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-amber-800">
              <span>Açıq çeklər</span>
              <span>
                {money(breakdown.open)} · {breakdown.openCount} çek
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex items-center justify-between gap-3 text-sky-700">
              <span>Ümumi</span>
              <span className="font-black">{money(breakdown.total)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DashCard({ title, desc, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white p-7 rounded-[35px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-110 transition-transform" />
      <div className="relative z-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SÜRƏTLİ</p>
          <p className="text-xl font-black text-slate-900 tracking-tighter italic">{title}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-2">{desc}</p>
        </div>
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#0ea5e9]/5 border border-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]">
        Aç <FiArrowRight />
      </div>
    </button>
  );
}

function TopList({ title, subtitle, items }) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-50">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{subtitle}</p>
        <p className="text-xl font-black text-slate-900 tracking-tighter italic mt-1">{title}</p>
      </div>
      <div className="p-4 md:p-6 space-y-2">
        {(items || []).length ? (
          items.map((x, i) => (
            <div
              key={x.key || i}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl ${
                i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
              }`}
            >
              <p className="text-[11px] font-black text-slate-700 truncate">{x.left}</p>
              <p className="text-[11px] font-black text-slate-900 shrink-0">{x.right}</p>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">
            Məlumat yoxdur
          </div>
        )}
      </div>
    </div>
  );
}

function CashCardStack({ cash, card, customRows = [] }) {
  return (
    <div className="space-y-3">
      <MiniStat
        title="Nağd"
        value={money(cash)}
        icon={<FiDollarSign />}
        color="text-emerald-600"
        bg="bg-emerald-50"
      />
      <MiniStat
        title="Kart"
        value={money(card)}
        icon={<FiCreditCard />}
        color="text-indigo-600"
        bg="bg-indigo-50"
      />
      {customRows.map((row, i) => {
        const pals = [
          { color: 'text-indigo-800', bg: 'bg-indigo-50' },
          { color: 'text-rose-800', bg: 'bg-rose-50' },
          { color: 'text-violet-800', bg: 'bg-violet-50' },
          { color: 'text-sky-800', bg: 'bg-sky-50' },
        ];
        const p = pals[i % pals.length];
        return (
          <MiniStat
            key={`${row.name}-${i}`}
            title={row.name}
            value={money(row.amount)}
            icon={<FiLayers />}
            color={p.color}
            bg={p.bg}
          />
        );
      })}
    </div>
  );
}

function SimpleList({ title, subtitle, items, empty, onMore, moreLabel, renderItem }) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-50 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{subtitle}</p>
          <p className="text-xl font-black text-slate-900 tracking-tighter italic mt-1">{title}</p>
        </div>
        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            className="shrink-0 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900"
          >
            {moreLabel}
          </button>
        ) : null}
      </div>
      <div className="p-4 md:p-6 space-y-2">
        {(items || []).length ? (
          items.map((x, i) =>
            typeof renderItem === 'function'
              ? renderItem(x, i)
              : (
                  <div
                    key={x.key || i}
                    className={`px-4 py-3 rounded-2xl ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black text-slate-700 truncate">{x.left}</p>
                      <p className="text-[11px] font-black text-slate-900 shrink-0">{x.right}</p>
                    </div>
                    {x.sub ? (
                      <p className="mt-1 text-[10px] font-bold text-slate-400 leading-snug line-clamp-2">
                        {x.sub}
                      </p>
                    ) : null}
                  </div>
                )
          )
        ) : (
          <div className="p-10 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">
            {empty || 'Məlumat yoxdur'}
          </div>
        )}
      </div>
    </div>
  );
}

