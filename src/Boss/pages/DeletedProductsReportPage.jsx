import React, { useMemo, useState, useCallback } from 'react';
import moment from 'moment';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../api/axios';
import PageMeta from '../../PageMeta';
import { mergeDeletedReportRows, sumDeletedMergedLineTotals } from '../../utils/deletedReportMerge';
import { formatBakuDateTime, apiDateToDatetimeLocalInput } from '../../utils/bakuDateTime';
import { bakuWallInputToApiDateTime } from '../../utils/reportApiDateRange';

function money(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return '0.00';
  return x.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

/** Bakı divarı (+04:00) — `Products/deleted-report` ilə terminal eyni format. */
function bakuWallRange(preset, customFrom, customTo) {
  const m = () => moment().utcOffset(240);
  let startM;
  let endM = m().clone().endOf('day');
  if (preset === 'today') {
    startM = m().clone().startOf('day');
  } else if (preset === 'week') {
    startM = m().clone().startOf('isoWeek');
  } else if (preset === 'month') {
    startM = m().clone().startOf('month');
  } else {
    const d0 = String(customFrom || '').trim();
    const d1 = String(customTo || '').trim();
    startM = moment(`${d0}T00:00:00+04:00`);
    endM = moment(`${d1}T23:59:59+04:00`);
    if (!startM.isValid() || !endM.isValid() || endM.isBefore(startM)) {
      throw new Error('Tarix aralığı yanlışdır.');
    }
  }
  const start = startM.format('YYYY-MM-DDTHH:mm:ss') + '+04:00';
  const end = endM.format('YYYY-MM-DDTHH:mm:ss') + '+04:00';
  const meta = `${startM.format('DD.MM.YYYY HH:mm')} — ${endM.format('DD.MM.YYYY HH:mm')}`;
  return { start, end, meta };
}

async function resolveRange(preset, customFrom, customTo, companyId) {
  if (preset === 'shift') {
    const sr = await api.get(`/CashShifts/active/${companyId}`);
    const sh = sr.data;
    const st = sh?.startTime ?? sh?.StartTime;
    if (!st) throw new Error('Açıq növbə tapılmadı.');
    const en = sh?.endTime ?? sh?.EndTime ?? null;
    const startWall = apiDateToDatetimeLocalInput(st);
    const endWall = en ? apiDateToDatetimeLocalInput(en) : apiDateToDatetimeLocalInput(new Date());
    if (!startWall || !endWall) throw new Error('Növbə tarixləri oxunmadı.');
    const start = bakuWallInputToApiDateTime(startWall);
    const end = bakuWallInputToApiDateTime(endWall);
    if (!start || !end) throw new Error('Növbə tarixləri yanlışdır.');
    const meta = `${formatBakuDateTime(st)} — ${
      en ? formatBakuDateTime(en) : `${moment().format('DD.MM.YYYY HH:mm')}`
    }`;
    return { start, end, meta };
  }
  return bakuWallRange(preset, customFrom, customTo);
}

export default function DeletedProductsReportPage() {
  const user = useMemo(() => readUser(), []);
  const companyId = user?.companyId ?? user?.CompanyId;

  const [preset, setPreset] = useState('today');
  const [customFrom, setCustomFrom] = useState(() => moment().format('YYYY-MM-DD'));
  const [customTo, setCustomTo] = useState(() => moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [meta, setMeta] = useState('');

  const items = Array.isArray(report?.items ?? report?.Items)
    ? report?.items ?? report?.Items ?? []
    : [];
  const orderRows = Array.isArray(report?.orderLineDeletions ?? report?.OrderLineDeletions)
    ? report?.orderLineDeletions ?? report?.OrderLineDeletions ?? []
    : [];

  const aggregated = useMemo(() => mergeDeletedReportRows(items, orderRows), [items, orderRows]);
  const total = useMemo(() => sumDeletedMergedLineTotals(aggregated), [aggregated]);
  const rawEventCount = items.length + orderRows.length;

  const fetchReport = useCallback(async () => {
    setError('');
    setReport(null);
    if (!companyId) {
      setError('Şirkət tapılmadı.');
      return;
    }
    setLoading(true);
    try {
      const { start, end, meta: m } = await resolveRange(preset, customFrom, customTo, companyId);
      setMeta(m);
      const res = await api.get('/Products/deleted-report', {
        params: { companyId, start, end },
        timeout: 90000,
      });
      setReport(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Hesabat alınmadı');
    } finally {
      setLoading(false);
    }
  }, [companyId, preset, customFrom, customTo]);

  const presetBtn = (key, label) => (
    <button
      key={key}
      type="button"
      onClick={() => setPreset(key)}
      className={`rounded-2xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition ${
        preset === key
          ? 'border-[#0ea5e9] bg-[#0ea5e9] text-white shadow-lg shadow-blue-100'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-fadeIn space-y-6 px-3 py-6 text-slate-900 md:px-6">
      <PageMeta title="Silinmələr | NeoPos Boss" description="Silinmiş məhsullar və cəm" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
            <FiTrash2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Silinmələr</h1>
            <p className="mt-1 max-w-xl text-sm font-medium text-slate-500">
              Sifarişdən ləğv və menyudan silinənlər (cəmlənmiş sətirlər). Eyni məhsul və eyni vahid qiymət bir
              sətirdə cəmlənir.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04] md:p-8">
        <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dövr</div>
        <div className="flex flex-wrap gap-2">
          {presetBtn('shift', 'Cari növbə')}
          {presetBtn('today', 'Bu gün')}
          {presetBtn('week', 'Bu həftə')}
          {presetBtn('month', 'Bu ay')}
          {presetBtn('range', 'Aralıq')}
        </div>

        {preset === 'range' ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Başlanğıc</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Son</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800"
              />
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchReport()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0ea5e9] px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-100 transition hover:bg-[#0284c7] disabled:opacity-50"
          >
            <FiSearch size={18} />
            {loading ? 'Yüklənir…' : 'Hesabat al'}
          </button>
        </div>

        {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
      </div>

      {report ? (
        <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-slate-50/40 p-5 md:p-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nəticə</div>
          <p className="text-sm font-bold text-slate-700">
            Hadisə sayı: {rawEventCount} · Cəmlənmiş sətir: {aggregated.length}
            {meta ? <span className="block pt-1 text-[12px] font-semibold text-slate-500">{meta}</span> : null}
          </p>
          {!rawEventCount ? (
            <p className="text-sm font-bold text-slate-500">Bu dövrdə qeyd yoxdur.</p>
          ) : null}

          {aggregated.length ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-white bg-white shadow-sm">
                <table className="w-full min-w-[320px] text-left text-[13px] font-bold text-slate-800">
                  <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Məhsul</th>
                      <th className="px-4 py-3 text-right tabular-nums">Miqdar</th>
                      <th className="px-4 py-3 text-right tabular-nums">Vahid qiymət</th>
                      <th className="px-4 py-3 text-right tabular-nums">Sətir cəmi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregated.map((row, idx) => {
                      const line = (Number(row.qty) || 0) * (Number(row.unit) || 0);
                      return (
                        <tr key={`${row.displayName}-${row.unit}-${idx}`} className="border-t border-slate-100">
                          <td className="px-4 py-2.5 align-top break-words">{row.displayName}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{String(row.qty)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{money(row.unit)} ₼</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-black">{money(line)} ₼</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 bg-slate-100/90 text-slate-900">
                      <td colSpan={3} className="px-4 py-3 text-left text-[11px] font-black uppercase">
                        Silinmiş məhsulların cəmi
                      </td>
                      <td className="px-4 py-3 text-right text-base font-black tabular-nums">{money(total)} ₼</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
