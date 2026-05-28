import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { FiUsers } from 'react-icons/fi';
import ReportRangeBar from '../components/Reports/ReportRangeBar';

function money(x) {
  const n = Number(x || 0);
  return `${n.toFixed(2)} ₼`;
}

export default function ReportsByWaitersPage() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const companyId = user?.companyId;

  const [activeRange, setActiveRange] = useState('today');
  const [start, setStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeOpenTables, setIncludeOpenTables] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadShiftDateRange = useCallback(async () => {
    const today = new Date();
    const endStr = format(today, 'yyyy-MM-dd');
    try {
      if (!companyId) return { start: endStr, end: endStr };
      const sr = await api.get(`/CashShifts/active/${companyId}`);
      const d = sr.data || null;
      const st = d?.startTime ?? d?.StartTime ?? d?.openTime ?? d?.OpenTime ?? null;
      const s = st ? new Date(st) : today;
      return { start: format(s, 'yyyy-MM-dd'), end: endStr };
    } catch {
      return { start: endStr, end: endStr };
    }
  }, [companyId]);

  const fetchReport = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      if (activeRange === 'shift') {
        const shiftRes = await api.get(`/CashShifts/active/${companyId}`);
        const shift = shiftRes.data || null;
        const shiftId = shift?.id ?? shift?.Id;
        if (!shiftId) {
          setData({ items: [], Items: [] });
          return;
        }
        const res = await api.get(`/Reports/shift/${shiftId}/by-waiter`, {
          params: { companyId, includeOpenTables },
        });
        setData(res.data);
        return;
      }

      const res = await api.get('/Reports/by-waiter', {
        params: { companyId, start, end, includeOpenTables },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, start, end, includeOpenTables, activeRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const items = data?.items || data?.Items || [];

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-left">
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Ofisiantlara görə hesabat
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            {activeRange === 'shift'
              ? 'Cari növbə · hər ofisiant üzrə satış və sifariş sayı'
              : 'Hər ofisiant üzrə satış və sifariş sayı'}
          </p>
        </div>

        <ReportRangeBar
          start={start}
          end={end}
          activeRange={activeRange}
          includeOpenTables={includeOpenTables}
          onToggleIncludeOpen={setIncludeOpenTables}
          showShiftRange
          onChange={({ start: s, end: e, activeRange: ar }) => {
            if (ar === 'shift') {
              void (async () => {
                const r = await loadShiftDateRange();
                setStart(r.start);
                setEnd(r.end);
                setActiveRange('shift');
              })();
              return;
            }
            if (s) setStart(s);
            if (e) setEnd(e);
            if (ar) setActiveRange(ar);
          }}
        />
      </div>

      {loading ? (
        <div className="py-40 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">
          Yüklənir...
        </div>
      ) : !data ? (
        <div className="bg-white p-20 rounded-[40px] text-center border border-dashed border-gray-200">
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Məlumat yoxdur.</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <FiUsers size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ofisiantlar</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter italic">Siyahı</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Cəmi: {items.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ofisiant</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Satış
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Sifariş sayı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x, idx) => (
                    <tr
                      key={`${x.waiterName || x.WaiterName || 'w'}-${idx}`}
                      className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      <td className="px-6 py-4 text-sm font-black text-slate-900 uppercase truncate max-w-[280px]">
                        {x.waiterName || x.WaiterName || '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-[#0ea5e9] tabular-nums whitespace-nowrap">
                        {money(x.revenue || x.Revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-slate-800 tabular-nums whitespace-nowrap">
                        {x.orderCount ?? x.OrderCount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!items.length ? (
              <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs border-t border-gray-50">
                Bu aralıqda məlumat yoxdur
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
