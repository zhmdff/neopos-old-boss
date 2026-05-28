import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addHours, format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import {
  FiUsers,
  FiSearch,
  FiTrendingUp,
  FiHash,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';
import api from '../../api/axios';

function money(x) {
  const n = Number(x || 0);
  return `${n.toFixed(2)} ₼`;
}

function parseApiDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string') return null;

  const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
  const looksIso = /^\d{4}-\d{2}-\d{2}T/.test(value);
  const s = looksIso && !hasTz ? `${value}Z` : value;

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const ranges = [
  { id: 'today', label: 'Bu gün' },
  { id: 'week', label: 'Bu həftə' },
  { id: 'month', label: 'Bu ay' },
  { id: 'year', label: 'Bu il' },
];

export default function CustomersLoyaltyPage() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const companyId = user?.companyId;

  const [activeRange, setActiveRange] = useState('month');
  const [start, setStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [q, setQ] = useState('');
  const [take, setTake] = useState(200);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const setQuickRange = (type) => {
    const today = new Date();
    let s = today;
    if (type === 'week') s = startOfWeek(today, { weekStartsOn: 1 });
    if (type === 'month') s = startOfMonth(today);
    if (type === 'year') s = startOfYear(today);
    setActiveRange(type);
    setStart(format(s, 'yyyy-MM-dd'));
    setEnd(format(today, 'yyyy-MM-dd'));
  };

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get('/Reports/customers-loyalty', {
        params: {
          companyId,
          start,
          end,
          q: q.trim() || undefined,
          take,
        },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, start, end, q, take]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const items = data?.items || data?.Items || [];
  const totalTopSpent = items.reduce((s, x) => s + Number(x.totalSpent || x.TotalSpent || 0), 0);
  const totalTopOrders = items.reduce((s, x) => s + Number(x.orderCount || x.OrderCount || 0), 0);

  return (
    <div className="animate-fadeIn bg-slate-50/80 px-3 py-5 text-left text-slate-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero + filtrlər */}
        <div className="mb-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1">
                <FiAward className="text-violet-600" size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">
                  Loyallıq
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Müştərilər</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Dövriyyəyə görə sıralanmış müştərilər: ümumi alış, sifariş sayı və son aktivlik.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 lg:max-w-xl lg:shrink-0">
              <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50/90 p-1">
                {ranges.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setQuickRange(r.id)}
                    className={`min-h-[40px] flex-1 rounded-xl px-3 py-2.5 text-center text-[11px] font-semibold transition-all sm:flex-none sm:px-4 ${
                      activeRange === r.id
                        ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:min-w-[260px]">
                  <FiCalendar className="shrink-0 text-slate-400" size={18} />
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => {
                      setActiveRange('custom');
                      setStart(e.target.value);
                    }}
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none"
                  />
                  <span className="text-slate-300">—</span>
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => {
                      setActiveRange('custom');
                      setEnd(e.target.value);
                    }}
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
                  <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ad və ya telefon…"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-24 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
            <p className="text-sm font-medium text-slate-500">Məlumatlar yüklənir…</p>
          </div>
        ) : !data ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">Məlumat göstərilə bilmədi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Müştəri (siyahıda)"
                value={String(data.totalCustomers ?? data.TotalCustomers ?? items.length ?? 0)}
                hint="Seçilmiş aralıq + filtr"
                icon={<FiUsers className="text-violet-600" size={22} />}
                accent="from-violet-500/10 to-transparent"
              />
              <StatCard
                label="Toplam alış (top siyahı)"
                value={money(totalTopSpent)}
                hint="Göstərilən sıra üzrə cəm"
                icon={<FiTrendingUp className="text-emerald-600" size={22} />}
                accent="from-emerald-500/10 to-transparent"
              />
              <StatCard
                label="Sifariş (top siyahı)"
                value={String(totalTopOrders)}
                hint="Göstərilən sıra üzrə cəm"
                icon={<FiHash className="text-sky-600" size={22} />}
                accent="from-sky-500/10 to-transparent"
              />
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Lider müştərilər</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Dövriyyəyə görə · max {take} sətir</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={take}
                    onChange={(e) => setTake(Number(e.target.value) || 200)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  >
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                    <option value={200}>Top 200</option>
                    <option value={500}>Top 500</option>
                  </select>
                  <button
                    type="button"
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <FiRefreshCw size={14} />
                    Yenilə
                  </button>
                </div>
              </div>

              {!items.length ? (
                <div className="px-6 py-20 text-center text-sm text-slate-500">Bu aralıqda müştəri tapılmadı.</div>
              ) : (
                <>
                  <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 xl:grid">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-3">Müştəri</div>
                    <div className="col-span-2">Əlaqə</div>
                    <div className="col-span-2 text-right">Toplam alış</div>
                    <div className="col-span-1 text-center">Sifariş</div>
                    <div className="col-span-1 text-right">Orta çek</div>
                    <div className="col-span-2 text-right">Son sifariş</div>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {items.map((x, idx) => {
                      const rank = idx + 1;
                      const name = x.fullName || x.FullName || '—';
                      const phone = x.phone || x.Phone || '—';
                      const addr = x.address || x.Address;
                      const spent = money(x.totalSpent || x.TotalSpent);
                      const orders = String(x.orderCount || x.OrderCount || 0);
                      const avg = money(x.avgTicket || x.AvgTicket);
                      const d = parseApiDate(x.lastOrderAt || x.LastOrderAt);
                      const lastLine =
                        d != null
                          ? `${format(addHours(d, 4), 'dd.MM.yyyy HH:mm')} · ${money(x.lastOrderTotal || x.LastOrderTotal)}`
                          : '—';

                      return (
                        <li key={x.customerId || x.CustomerId || idx}>
                          <div className="xl:hidden">
                            <div className="flex gap-4 p-5 transition hover:bg-slate-50/80">
                              <RankBadge rank={rank} />
                              <div className="min-w-0 flex-1 space-y-3">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Müştəri
                                  </p>
                                  <p className="truncate text-base font-semibold text-slate-900">{name}</p>
                                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                                    <span className="inline-flex items-center gap-1.5">
                                      <FiPhone size={12} className="text-slate-400" />
                                      {phone}
                                    </span>
                                    {addr ? (
                                      <span className="inline-flex min-w-0 items-center gap-1.5">
                                        <FiMapPin size={12} className="shrink-0 text-slate-400" />
                                        <span className="truncate">{addr}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <MetricPill label="Toplam" value={spent} />
                                  <MetricPill label="Sifariş" value={orders} />
                                  <MetricPill label="Orta çek" value={avg} />
                                  <MetricPill label="Son" value={lastLine} small />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="hidden items-center gap-3 px-6 py-4 transition hover:bg-slate-50/60 xl:grid xl:grid-cols-12">
                            <div className="col-span-1 flex justify-center">
                              <RankBadge rank={rank} compact />
                            </div>
                            <div className="col-span-3 min-w-0">
                              <p className="truncate font-semibold text-slate-900">{name}</p>
                              {addr ? (
                                <p className="mt-0.5 truncate text-xs text-slate-500">{addr}</p>
                              ) : null}
                            </div>
                            <div className="col-span-2 min-w-0 text-sm text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <FiPhone size={14} className="shrink-0 text-slate-400" />
                                <span className="truncate">{phone}</span>
                              </span>
                            </div>
                            <div className="col-span-2 text-right font-semibold tabular-nums text-slate-900">
                              {spent}
                            </div>
                            <div className="col-span-1 text-center font-semibold tabular-nums text-slate-800">
                              {orders}
                            </div>
                            <div className="col-span-1 text-right text-sm font-medium tabular-nums text-slate-700">
                              {avg}
                            </div>
                            <div className="col-span-2 text-right text-xs font-medium leading-snug text-slate-600">
                              {lastLine}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, icon, accent }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.02] sm:p-6`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-100`}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank, compact }) {
  const top = rank <= 3;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-bold tabular-nums ring-1 ${
        top
          ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-900 ring-amber-200/80'
          : 'bg-slate-100 text-slate-600 ring-slate-200/80'
      } ${compact ? 'h-9 w-9 text-sm' : 'h-12 w-12 text-base'}`}
    >
      {rank}
    </div>
  );
}

function MetricPill({ label, value, small }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 font-semibold text-slate-900 ${small ? 'text-[11px] leading-snug' : 'text-sm tabular-nums'}`}>
        {value}
      </p>
    </div>
  );
}
