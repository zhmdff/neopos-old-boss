import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { FiBox, FiHash, FiTrendingUp } from 'react-icons/fi';
import ReportRangeBar from '../components/Reports/ReportRangeBar';

function money(x) {
  const n = Number(x || 0);
  return `${n.toFixed(2)} ₼`;
}

function pct(x) {
  const n = Number(x || 0);
  if (!Number.isFinite(n)) return '0%';
  return `${(n * 100).toFixed(1)}%`;
}

function qty(x) {
  const n = Number(x || 0);
  if (!Number.isFinite(n)) return '0';
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return isInt ? String(Math.round(n)) : String(n.toFixed(2));
}

export default function ReportsByProductsPage() {
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

  const [take, setTake] = useState(50);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const res = await api.get(`/Reports/shift/${shiftId}/by-product`, {
          params: { companyId, take, includeOpenTables },
        });
        setData(res.data);
        return;
      }

      const res = await api.get('/Reports/by-product', {
        params: { companyId, start, end, includeOpenTables, take },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, start, end, includeOpenTables, take, activeRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const items = data?.items || data?.Items || [];

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-left">
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Məhsullara görə hesabat
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            {activeRange === 'shift'
              ? `Cari növbə · Top ${take}`
              : `Ən çox satılan məhsullar (Top ${take})`}
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-end w-full xl:w-auto">
          <ReportRangeBar
            start={start}
            end={end}
            activeRange={activeRange}
            includeOpenTables={includeOpenTables}
            onToggleIncludeOpen={setIncludeOpenTables}
            showShiftRange
            onChange={({ start: s, end: e, activeRange: ar }) => {
              if (s) setStart(s);
              if (e) setEnd(e);
              if (ar) setActiveRange(ar);
            }}
          />

          <select
            value={take}
            onChange={(e) => setTake(Number(e.target.value) || 50)}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-600 w-full xl:w-auto"
          >
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
            <option value={200}>Top 200</option>
          </select>
        </div>
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
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <MiniStat title="Toplam satış (Top)" value={money(items.reduce((s, x) => s + Number(x.revenue || x.Revenue || 0), 0))} icon={<FiTrendingUp />} color="text-blue-600" bg="bg-sky-50" />
            <MiniStat title="Miqdar (Top)" value={qty(items.reduce((s, x) => s + Number(x.quantity || x.Quantity || 0), 0))} icon={<FiHash />} color="text-emerald-600" bg="bg-emerald-50" isMoney={false} />
            <MiniStat title="Məhsul sayı" value={String(items.length)} icon={<FiBox />} color="text-indigo-600" bg="bg-indigo-50" isMoney={false} />
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center">
                  <FiBox size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Top məhsullar</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter italic">Satış + xərc + mənfəət</p>
                </div>
              </div>
              <span className="hidden md:inline-flex px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Cəmi: {items.length}
              </span>
            </div>

            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 md:px-7 py-4 bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Məhsul</div>
              <div className="col-span-2 text-right">Miqdar</div>
              <div className="col-span-2 text-right">Satış</div>
              <div className="col-span-2 text-right">Mənfəət</div>
            </div>

            <div className="divide-y divide-gray-50">
              {items.map((x, idx) => (
                <div
                  key={x.productId || x.ProductId || idx}
                  className={`p-6 md:p-7 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} border-l-4 ${
                    idx % 3 === 0 ? 'border-l-blue-200' : idx % 3 === 1 ? 'border-l-emerald-200' : 'border-l-indigo-200'
                  }`}
                >
                  <div className="lg:hidden flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        #{idx + 1} · {x.categoryName || x.CategoryName || 'Kateqoriya'}
                      </p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase truncate">
                        {x.productName || x.ProductName || 'Məhsul'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mənfəət</p>
                      <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                        {money((x.profit || x.Profit) ?? (Number(x.revenue || x.Revenue || 0) - Number(x.cost || x.Cost || 0)))}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        {pct(x.profitMargin || x.ProfitMargin)}
                      </p>
                    </div>
                  </div>

                  <div className="lg:hidden mt-4 grid grid-cols-3 gap-3">
                    <Chip label="Miqdar" value={qty(x.quantity || x.Quantity)} />
                    <Chip label="Satış" value={money(x.revenue || x.Revenue)} />
                    <Chip label="Xərc" value={money(x.cost || x.Cost)} />
                  </div>

                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-[12px] font-black text-slate-400">{idx + 1}</div>
                    <div className="col-span-5 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {x.categoryName || x.CategoryName || 'Kateqoriya'}
                      </p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter uppercase truncate">
                        {x.productName || x.ProductName || 'Məhsul'}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Miqdar</p>
                      <p className="text-lg font-black text-slate-900">{qty(x.quantity || x.Quantity)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Satış</p>
                      <p className="text-lg font-black text-[#0ea5e9]">{money(x.revenue || x.Revenue)}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        Xərc: {money(x.cost || x.Cost)}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mənfəət</p>
                      <p className="text-lg font-black text-emerald-600">
                        {money((x.profit || x.Profit) ?? (Number(x.revenue || x.Revenue || 0) - Number(x.cost || x.Cost || 0)))}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        {pct(x.profitMargin || x.ProfitMargin)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {!items.length ? (
                <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
                  Bu aralıqda məlumat yoxdur
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ title, value, icon, color, bg, isMoney = true }) {
  return (
    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${bg} opacity-40 rounded-full group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-4 ${bg} ${color} rounded-2xl text-2xl shadow-sm`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter truncate">{isMoney ? value : value}</h3>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4 min-w-[150px]">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-black text-slate-800 tracking-tight mt-1 truncate">{value}</p>
    </div>
  );
}

