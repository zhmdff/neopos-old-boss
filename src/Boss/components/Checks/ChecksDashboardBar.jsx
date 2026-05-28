import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  FiTrendingUp,
  FiUsers,
  FiLayers,
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
} from 'react-icons/fi';
import api from '../../../api/axios';
import { reconcileShiftPaymentDisplay } from '../../../utils/reportPaymentDisplay';

function money(x) {
  const n = Number(x || 0);
  return `${n.toFixed(2)} ₼`;
}

export default function ChecksDashboardBar({ startDate, endDate }) {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const companyId = user?.companyId;
  const sd = startDate || format(new Date(), 'yyyy-MM-dd');
  const ed = endDate || format(new Date(), 'yyyy-MM-dd');

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState(null);
  const [waiters, setWaiters] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [sumRes, tRes, wRes] = await Promise.all([
        api.get('/Reports/summary', {
          params: { companyId, start: sd, end: ed, includeOpenTables: false },
        }),
        api.get('/Reports/by-table', {
          params: { companyId, start: sd, end: ed, includeOpenTables: false },
        }),
        api.get('/Reports/by-waiter', {
          params: { companyId, start: sd, end: ed, includeOpenTables: false },
        }),
      ]);
      setSummary(sumRes.data);
      setTables(tRes.data);
      setWaiters(wRes.data);
    } catch (e) {
      console.error(e);
      setSummary(null);
      setTables(null);
      setWaiters(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, sd, ed]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const topTables = (tables?.items || tables?.Items || []).slice(0, 3);
  const topWaiters = (waiters?.items || waiters?.Items || []).slice(0, 3);
  const customPayTotals = summary?.customPaymentTotals ?? summary?.CustomPaymentTotals;
  const customPayList = Array.isArray(customPayTotals) ? customPayTotals : [];
  const payDisplay = useMemo(
    () => (summary ? reconcileShiftPaymentDisplay(summary) : { cash: 0, card: 0 }),
    [summary],
  );

  return (
    <div className="mb-8">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              DASHBOARD · Çeklər
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
              Qısa icmal
            </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-2">
                Aralıq: <span className="font-black text-slate-700">{sd}</span> —{' '}
                <span className="font-black text-slate-700">{ed}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <QuickLink
              label="Maliyyə analizi"
              onClick={() => navigate('/boss/reports')}
            />
            <QuickLink
              label="Masalara görə"
              onClick={() => navigate('/boss/reports/tables')}
            />
            <QuickLink
              label="Ofisiantlara görə"
              onClick={() => navigate('/boss/reports/waiters')}
            />
            <QuickLink
              label="Növbələr"
              onClick={() => navigate('/boss/shifts')}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 md:p-12 animate-pulse text-center text-gray-300 font-black uppercase tracking-widest text-xs">
            Yüklənir...
          </div>
        ) : (
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-[32px] bg-slate-50/60 border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center">
                    <FiTrendingUp />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Ümumi satış
                    </p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      {money(summary?.totalRevenue || summary?.TotalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TinyStat
                  icon={<FiDollarSign />}
                  label="Nağd"
                  value={money(payDisplay.cash)}
                  className="min-w-[calc(50%-0.25rem)] flex-1 basis-[calc(50%-0.25rem)] sm:min-w-[120px] sm:flex-none sm:basis-[140px]"
                />
                <TinyStat
                  icon={<FiCreditCard />}
                  label="Kart"
                  value={money(payDisplay.card)}
                  className="min-w-[calc(50%-0.25rem)] flex-1 basis-[calc(50%-0.25rem)] sm:min-w-[120px] sm:flex-none sm:basis-[140px]"
                />
                {customPayList.map((row, i) => {
                  const ring =
                    i % 4 === 0
                      ? 'border-indigo-100 bg-indigo-50/80 text-indigo-900'
                      : i % 4 === 1
                        ? 'border-rose-100 bg-rose-50/80 text-rose-900'
                        : i % 4 === 2
                          ? 'border-violet-100 bg-violet-50/80 text-violet-900'
                          : 'border-sky-100 bg-sky-50/80 text-sky-900';
                  return (
                    <div
                      key={String(row.methodId ?? row.MethodId ?? i)}
                      className={`min-w-[calc(50%-0.25rem)] flex-1 basis-[calc(50%-0.25rem)] rounded-2xl border px-3 py-2.5 sm:min-w-[120px] sm:flex-none sm:basis-[140px] ${ring}`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-80 truncate">
                        {row.methodName ?? row.MethodName ?? '—'}
                      </p>
                      <p className="mt-0.5 text-sm font-black tabular-nums">{money(row.amount ?? row.Amount)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FiClock />
                Sifariş sayı: <span className="text-slate-900">{summary?.orderCount || summary?.OrderCount || 0}</span>
              </div>
            </div>

            <div className="rounded-[32px] bg-white border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FiLayers />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Top masalar
                  </p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">
                    Dövriyyə
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {topTables.length ? (
                  topTables.map((t, i) => (
                    <Row
                      key={t.tableId || t.TableId || i}
                      left={`${t.hallName || t.HallName || 'Zal'} · ${t.tableName || t.TableName || 'Masa'}`}
                      right={money(t.revenue || t.Revenue)}
                      zebra={i % 2 === 1}
                    />
                  ))
                ) : (
                  <EmptyRow />
                )}
              </div>
            </div>

            <div className="rounded-[32px] bg-white border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FiUsers />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Top ofisiantlar
                  </p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">
                    Dövriyyə
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {topWaiters.length ? (
                  topWaiters.map((w, i) => (
                    <Row
                      key={`${w.waiterName || w.WaiterName || 'w'}-${i}`}
                      left={w.waiterName || w.WaiterName || '—'}
                      right={money(w.revenue || w.Revenue)}
                      zebra={i % 2 === 1}
                    />
                  ))
                ) : (
                  <EmptyRow />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 transition font-black text-[10px] uppercase tracking-widest"
    >
      {label}
      <FiArrowRight />
    </button>
  );
}

function TinyStat({ icon, label, value, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 px-4 py-3 flex items-center gap-3 ${className}`.trim()}>
      <div className="text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm font-black text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function Row({ left, right, zebra }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-2xl ${zebra ? 'bg-slate-50/70' : 'bg-transparent'}`}>
      <p className="text-[11px] font-black text-slate-700 truncate">{left}</p>
      <p className="text-[11px] font-black text-slate-900 shrink-0">{right}</p>
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="p-10 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">
      Məlumat yoxdur
    </div>
  );
}

