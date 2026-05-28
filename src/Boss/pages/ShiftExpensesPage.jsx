import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { FiDollarSign, FiChevronLeft, FiChevronRight, FiCalendar, FiX } from 'react-icons/fi';
import api from '../../api/axios';

function money(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return '0.00 ₼';
  return `${x.toFixed(2)} ₼`;
}

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

const SHIFT_GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ShiftExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pinnedShiftId = useMemo(() => {
    const raw = searchParams.get('shiftId');
    if (!raw || !SHIFT_GUID_RE.test(String(raw).trim())) return '';
    return String(raw).trim();
  }, [searchParams]);
  const pinnedShiftLabel = useMemo(() => {
    try {
      return decodeURIComponent(searchParams.get('shiftLabel') || '').trim();
    } catch {
      return (searchParams.get('shiftLabel') || '').trim();
    }
  }, [searchParams]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const companyId = user?.companyId || user?.CompanyId;

  const [mode, setMode] = useState('shift'); // shift | today | month | year | custom
  const [from, setFrom] = useState(() => moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [to, setTo] = useState(() => moment().format('YYYY-MM-DD'));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setErr('');
    try {
      if (mode === 'shiftPinned' && pinnedShiftId) {
        const res = await api.get('/ShiftExpenses/history', {
          params: { companyId, cashShiftId: pinnedShiftId, page, pageSize },
        });
        const data = res.data || {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalCount(Number(data.totalCount ?? data.TotalCount ?? 0));
        setTotalAmount(Number(data.totalAmount ?? data.TotalAmount ?? 0));
        return;
      }

      if (mode === 'shift') {
        const res = await api.get('/ShiftExpenses/active', { params: { companyId } });
        const data = res.data || [];
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        setTotalCount(list.length);
        setTotalAmount(list.reduce((s, x) => s + Number(pick(x, 'amount', 'Amount') || 0), 0));
        return;
      }

      const res = await api.get('/ShiftExpenses/history', {
        params: {
          companyId,
          from: moment(from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          to: moment(to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          page,
          pageSize,
        },
      });
      const data = res.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotalCount(Number(data.totalCount ?? data.TotalCount ?? 0));
      setTotalAmount(Number(data.totalAmount ?? data.TotalAmount ?? 0));
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'Xəta');
      setItems([]);
      setTotalCount(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [companyId, from, to, page, pageSize, mode, pinnedShiftId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!pinnedShiftId) return;
    setMode('shiftPinned');
    setPage(1);
  }, [pinnedShiftId]);

  const setRangeMode = (nextMode) => {
    if (pinnedShiftId) setSearchParams({}, { replace: true });
    setMode(nextMode);
    setPage(1);

    if (nextMode === 'today') {
      const d = moment();
      setFrom(d.format('YYYY-MM-DD'));
      setTo(d.format('YYYY-MM-DD'));
    }

    if (nextMode === 'month') {
      const start = moment().startOf('month');
      const end = moment().endOf('month');
      setFrom(start.format('YYYY-MM-DD'));
      setTo(end.format('YYYY-MM-DD'));
    }

    if (nextMode === 'year') {
      const start = moment().startOf('year');
      const end = moment().endOf('year');
      setFrom(start.format('YYYY-MM-DD'));
      setTo(end.format('YYYY-MM-DD'));
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Daxili xərclər
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Növbələr üzrə qeyd olunan xərclərin tarixçəsi
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div
            className={`bg-white p-1.5 rounded-[22px] shadow-sm border border-gray-100 flex gap-1 overflow-x-auto no-scrollbar ${
              pinnedShiftId ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {[
              { id: 'shift', label: 'Cari növbə' },
              { id: 'today', label: 'Bugün' },
              { id: 'month', label: 'Bu ay' },
              { id: 'year', label: 'Bu il' },
              { id: 'custom', label: 'Aralıq' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setRangeMode(b.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase transition-all whitespace-nowrap ${
                  mode === b.id || (b.id === 'shift' && mode === 'shiftPinned')
                    ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                    : 'hover:bg-gray-50 text-slate-500'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {mode === 'custom' ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                <FiCalendar className="text-gray-400" />
                <span className="text-[10px] font-black uppercase text-gray-400">Başlanğıc</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setPage(1);
                    setFrom(e.target.value);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                <FiCalendar className="text-gray-400" />
                <span className="text-[10px] font-black uppercase text-gray-400">Son</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setPage(1);
                    setTo(e.target.value);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent outline-none"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {pinnedShiftId ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-indigo-900">
            Seçilmiş növbənin xərcləri
            {pinnedShiftLabel ? (
              <span className="ml-2 font-bold normal-case text-indigo-700">· {pinnedShiftLabel}</span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchParams({}, { replace: true });
              setMode('shift');
              setPage(1);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-indigo-100 hover:border-[#0ea5e9]/40"
          >
            <FiX size={14} />
            Bağla
          </button>
        </div>
      ) : null}

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">{err}</div>
      ) : null}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-40 gap-4 bg-white rounded-[40px] shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-24 rounded-[40px] text-center border border-dashed border-gray-200">
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Bu dövrdə xərc yoxdur.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="text-left py-4 px-4">Tarix</th>
                  <th className="text-left py-4 px-4">Növbə</th>
                  <th className="text-left py-4 px-4">Qeyd</th>
                  <th className="text-left py-4 px-4">Kim</th>
                  <th className="text-right py-4 px-4">Məbləğ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const id = pick(row, 'id', 'Id') ?? idx;
                  const amt = pick(row, 'amount', 'Amount');
                  const note = pick(row, 'note', 'Note') ?? '';
                  const who = pick(row, 'recordedByUserName', 'RecordedByUserName') ?? '';
                  const created = pick(row, 'createdAt', 'CreatedAt');
                  const st = pick(row, 'shiftStartTime', 'ShiftStartTime');
                  const closed = pick(row, 'shiftIsClosed', 'ShiftIsClosed');
                  return (
                    <tr key={id} className="border-b border-gray-50 hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {created ? moment.utc(created).format('DD.MM.YYYY HH:mm') : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {st ? moment.utc(st).format('DD.MM.YYYY HH:mm') : '—'}
                        {closed === false ? (
                          <span className="ml-2 text-emerald-600 font-black text-[9px] uppercase">Aktiv</span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-md break-words">{note}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{who || '—'}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">{money(amt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <FiDollarSign /> Cəmi sətir: {totalCount}
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                <FiDollarSign /> Cəmi məbləğ: {money(totalAmount)}
              </div>
            </div>

            {(mode === 'shiftPinned' || mode !== 'shift') && totalPages > 1 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30"
                >
                  <FiChevronLeft />
                </button>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                  Səhifə {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30"
                >
                  <FiChevronRight />
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
