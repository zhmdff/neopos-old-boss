import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiSave,
  FiRotateCcw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEyeOff,
  FiLayers,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';
import {
  KITCHEN_SECTION_DEFAULTS,
  normalizeKitchenSections,
} from '../utils/kitchenReceiptDesign';

const KitchenPrinterDesignPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState(() => normalizeKitchenSections(KITCHEN_SECTION_DEFAULTS));
  const [escPosCompact, setEscPosCompact] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  const companyId = user?.companyId || user?.CompanyId;

  const fetchCompany = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/Companies/${companyId}`);
      const c = res.data;
      let parsed = {};
      try {
        parsed = JSON.parse(c?.receiptDesignSettingsJson || '{}');
      } catch {
        parsed = {};
      }
      const k = parsed.kitchen && typeof parsed.kitchen === 'object' ? parsed.kitchen : {};
      setSections(normalizeKitchenSections(k.sections ?? k.Sections));
      setEscPosCompact(k.lan?.escPosCompact === true || k.lan?.EscPosCompact === true);
    } catch {
      toast.error('Şirkət məlumatı alınmadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const tId = toast.loading('Yadda saxlanır...');
    try {
      const res = await api.get(`/Companies/${companyId}`);
      let parsed = {};
      try {
        parsed = JSON.parse(res.data?.receiptDesignSettingsJson || '{}');
      } catch {
        parsed = {};
      }
      parsed.kitchen = {
        ...(parsed.kitchen && typeof parsed.kitchen === 'object' ? parsed.kitchen : {}),
        sections: normalizeKitchenSections(sections),
        lan: {
          ...(parsed.kitchen?.lan && typeof parsed.kitchen.lan === 'object' ? parsed.kitchen.lan : {}),
          escPosCompact,
        },
      };
      await api.put(`/Companies/${companyId}/receipt-design`, {
        receiptDesignSettingsJson: JSON.stringify(parsed),
      });
      toast.success('Yadda saxlanıldı', { id: tId });
      await fetchCompany();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xəta baş verdi', { id: tId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin mx-auto" />
        <div className="text-[#0ea5e9] font-black text-[10px] uppercase tracking-widest mt-3">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-3 py-5 md:px-6 md:py-8">
      <Toaster position="bottom-right" />

      <div className="mx-auto mb-6 max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 p-6 shadow-sm ring-1 ring-slate-900/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 sm:flex">
              <FiLayers size={26} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mətbəx printer</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Mətbəx slipinin blokları və şrift seçimi. Terminallar parametri təxminən 1–3 dəqiqə ərzində yeniləyir.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
            <button
              type="button"
              onClick={() => {
                setSections(normalizeKitchenSections(KITCHEN_SECTION_DEFAULTS));
                setEscPosCompact(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FiRotateCcw size={16} />
              İlkin təyinat
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-[#0ea5e9]/25 transition hover:bg-sky-600 disabled:opacity-50"
            >
              {saving ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
              Yadda saxla
            </button>
          </div>
        </div>
      </div>

      <div
        className="mx-auto mb-8 flex max-w-7xl gap-3 rounded-2xl border border-sky-100 bg-sky-50/90 px-4 py-3 text-sky-950 sm:items-center sm:px-5 sm:py-3.5"
        role="status"
      >
        <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 sm:mt-0" aria-hidden />
        <p className="text-xs font-medium leading-snug sm:text-sm">
          Dəyişikliklər saxlanandan sonra mətbəx printer çıxışı terminallarda qısa müddət ərzində yenilənir.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Slip məzmunu</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Bloklar və şrift</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                <FiCheckCircle size={14} />
                Canlı ön baxış
              </span>
            </div>

            <label className="flex cursor-pointer select-none items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={escPosCompact}
                onChange={(e) => setEscPosCompact(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
              />
              <div>
                <div className="text-sm font-bold text-slate-900">LAN ESC/POS — kompakt şrift</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Aktiv olanda IP printerdə mətn sıxıla bilər — dar kağız və ya çox sətir üçün faydalıdır.
                </p>
              </div>
            </label>

            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Sətir sırası</div>
              <p className="mt-1 text-sm text-slate-600">
                Hər blok üçün görünmə, ölçü və hizalama; sağdakı nümunə dərhal yenilənir.
              </p>
            </div>

            <KitchenSectionsEditor sections={sections} onChange={setSections} />
          </div>
        </div>

        <div className="xl:col-span-5 xl:pt-1">
          <div className="sticky top-4 space-y-3">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 to-transparent px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <FiLayers size={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Ön baxış</div>
                  <div className="truncate text-base font-bold text-slate-900">Mətbəx slipi (72&nbsp;mm)</div>
                </div>
              </div>
              <div className="bg-gradient-to-b from-slate-50/90 to-slate-100/40 px-4 py-6 sm:px-6">
                <KitchenPreviewSections sections={sections} workshopSample="IZQARA" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenPrinterDesignPage;

function KitchenSectionsEditor({ sections, onChange }) {
  const list = Array.isArray(sections) ? sections : [];
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    onChange(next);
  };

  const update = (idx, patch) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 ring-1 ring-slate-900/[0.03]">
      {list.map((row, idx) => (
        <div
          key={`${row.key}-${idx}`}
          className="border-b border-slate-100/90 bg-white px-4 py-4 last:border-b-0 sm:px-5 sm:py-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-slate-900">{row.label}</div>
              <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {row.key}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => update(idx, { enabled: !row.enabled })}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wide ${
                  row.enabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
                title={row.enabled ? 'Aktiv' : 'Söndürülüb'}
              >
                {row.enabled ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                {row.enabled ? 'Görünür' : 'Gizli'}
              </button>
              <button
                type="button"
                onClick={() => move(idx, -1)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                title="Yuxarı"
              >
                <FiArrowUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                title="Aşağı"
              >
                <FiArrowDown size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField
              label="Ölçü"
              value={row.size || 'md'}
              options={[
                { value: 'xs', label: 'Çox kiçik' },
                { value: 'sm', label: 'Kiçik' },
                { value: 'md', label: 'Orta' },
                { value: 'lg', label: 'Böyük' },
              ]}
              onChange={(v) => update(idx, { size: v })}
            />
            <SelectField
              label="Qalınlıq"
              value={row.thickness || 'normal'}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Qalın' },
              ]}
              onChange={(v) => update(idx, { thickness: v })}
            />
            <SelectField
              label="Məkanı"
              value={row.align || 'left'}
              options={[
                { value: 'left', label: 'Sol' },
                { value: 'center', label: 'Mərkəz' },
                { value: 'right', label: 'Sağ' },
              ]}
              onChange={(v) => update(idx, { align: v })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
      >
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function KitchenPreviewSections({ sections, workshopSample }) {
  const list = normalizeKitchenSections(sections);
  const now = new Date();
  const dt = now.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sizeToPx = (s) => (s === 'xs' ? 10 : s === 'sm' ? 12 : s === 'lg' ? 18 : 14);
  const w = (t) => (t === 'bold' ? 900 : 700);
  const al = (a) => (a === 'center' || a === 'right' ? a : 'left');

  const line = (text, row) => {
    if (!text || row?.enabled === false) return null;
    return (
      <div
        style={{
          fontSize: `${sizeToPx(row?.size)}px`,
          fontWeight: w(row?.thickness),
          textAlign: al(row?.align),
          margin: '2px 0',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    );
  };

  const sample = {
    printDate: dt.replace(' ', ' -- '),
    workshopName: workshopSample,
    waiter: 'Əli Məmmədov',
    hall: 'VIP Zal',
    table: 'Masa 12',
    openTime: '08.05.2026 14:43',
    items: [
      { name: 'Dönər', qty: '2', note: '' },
      { name: 'Ayran', qty: '1', note: 'Sogsuz' },
    ],
  };

  return (
    <div className="flex justify-center">
      <div
        style={{
          width: `72mm`,
          padding: `2mm`,
          background: '#fff',
          color: '#000',
          fontFamily: "'Courier New', Courier, monospace",
          lineHeight: 1.45,
          border: '1px dashed #e2e8f0',
          borderRadius: 12,
        }}
      >
        {list.map((row, idx) => {
          const k = String(row?.key || '');
          if (row?.enabled === false) return null;
          if (k === 'printDate') return <React.Fragment key={idx}>{line(`TARIX: ${sample.printDate}`, row)}</React.Fragment>;
          if (k === 'workshopName') return <React.Fragment key={idx}>{line(sample.workshopName, row)}</React.Fragment>;
          if (k === 'waiter') return <React.Fragment key={idx}>{line(`OFSIYANT: ${sample.waiter}`, row)}</React.Fragment>;
          if (k === 'hall') return <React.Fragment key={idx}>{line(`ZAL: ${sample.hall}`, row)}</React.Fragment>;
          if (k === 'table') return <React.Fragment key={idx}>{line(`MASA: ${sample.table}`, row)}</React.Fragment>;
          if (k === 'openTime') return <React.Fragment key={idx}>{line(`ACILIS: ${sample.openTime}`, row)}</React.Fragment>;
          if (k === 'items') {
            return (
              <div key={idx} style={{ marginTop: 6 }}>
                <div
                  style={{
                    borderTop: '1px dashed #000',
                    borderBottom: '1px dashed #000',
                    padding: '4px 0',
                    fontWeight: 900,
                    fontSize: `${sizeToPx(row?.size)}px`,
                  }}
                >
                  Məhsul siyahısı (nümunə)
                </div>
                {sample.items.map((x, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      fontSize: `${sizeToPx(row?.size)}px`,
                      fontWeight: w(row?.thickness),
                    }}
                  >
                    <span>{x.name}</span>
                    <span>{x.qty}</span>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
