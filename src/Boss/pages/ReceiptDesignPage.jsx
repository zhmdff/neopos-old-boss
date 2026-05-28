import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiLoader,
  FiSave,
  FiRotateCcw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEyeOff,
  FiPrinter,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';
import { normalizeKitchenSections } from '../utils/kitchenReceiptDesign';

const CASHIER_SECTION_DEFAULTS = Object.freeze([
  { key: 'companyName', label: 'Restoranın adı', enabled: true, size: 'lg', thickness: 'bold', align: 'center' },
  { key: 'checkNumber', label: 'Kassa çekinin nömrəsi', enabled: false, size: 'sm', thickness: 'bold', align: 'center' },
  { key: 'printDate', label: 'Çap tarixi', enabled: false, size: 'sm', thickness: 'bold', align: 'center' },
  { key: 'waiter', label: 'Ofisiant', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'customer', label: 'Müştəri', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'guests', label: 'Qonaq sayı', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'hall', label: 'Zal', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'table', label: 'Masa', enabled: true, size: 'md', thickness: 'bold', align: 'left' },
  { key: 'openTime', label: 'Masanın açılış tarixi', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'closeTime', label: 'Masanın bağlanış tarixi', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'items', label: 'Məhsullar', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'itemsTotal', label: 'Məhsulların cəmi', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'service', label: 'Servis haqqı', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'deposit', label: 'Depozit', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'discount', label: 'Endirim', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'grandTotal', label: 'Yekun', enabled: true, size: 'lg', thickness: 'bold', align: 'left' },
  { key: 'payment', label: 'Ödəniş üsulu', enabled: true, size: 'sm', thickness: 'bold', align: 'left' },
  { key: 'extra', label: 'Əlavə mətn (Təşəkkür edirik)', enabled: true, size: 'sm', thickness: 'bold', align: 'center' },
]);

const DEFAULT_DESIGN = Object.freeze({
  cashier: {
    // Boss UI: istifadəçi-friendly seçimlər (USB/LAN raw ESC/POS üçün də istifadə olunur)
    // size: xs | sm | md | lg
    preset: {
      size: 'md',
      thickness: 'normal', // normal | bold
    },

    // Yeni format: hər sətrin sırası + görünməsi + ölçü/qalınlıq/hizalama
    sections: CASHIER_SECTION_DEFAULTS,

    // Terminal/ESC-POS uyğunluq üçün köhnə sahələri saxlayırıq (encodeKassaReceiptBytes bunu oxuyur)
    companyFontPx: 16,
    metaFontPx: 11,
    tableFontPx: 14,
    itemsFontPx: 12,
    totalsFontPx: 12,
    grandTotalFontPx: 16,
    footerFontPx: 11,
    lineHeight: 1.4,
  },
  // Mətbəx slipi: ayrıca `/boss/kitchen-printer-design` — burada yalnız kassa redaktə olunur, amma saxlananda `kitchen` JSON saxlanılır.
});

function safeNum(x, fallback) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

const SIZE_PRESETS = Object.freeze({
  xs: { company: 12, meta: 9, table: 11, items: 9, totals: 9, grand: 12, footer: 9, lh: 1.35 },
  sm: { company: 14, meta: 10, table: 12, items: 10, totals: 10, grand: 14, footer: 10, lh: 1.4 },
  md: { company: 16, meta: 11, table: 14, items: 12, totals: 12, grand: 16, footer: 11, lh: 1.45 },
  lg: { company: 18, meta: 12, table: 16, items: 13, totals: 13, grand: 18, footer: 12, lh: 1.5 },
});

function normalizePresetSize(s) {
  return s === 'xs' || s === 'sm' || s === 'md' || s === 'lg' ? s : 'md';
}

function normalizeThickness(t) {
  return t === 'normal' || t === 'bold' ? t : 'normal';
}

function normalizeAlign(a) {
  return a === 'left' || a === 'center' || a === 'right' ? a : 'left';
}

function normalizeSectionRow(r, fallback) {
  const f = fallback || {};
  const key = String(r?.key ?? f.key ?? '').trim();
  if (!key) return null;
  return {
    key,
    label: String(r?.label ?? f.label ?? key),
    enabled: r?.enabled === false ? false : true,
    size: normalizePresetSize(r?.size ?? f.size ?? 'md'),
    thickness: normalizeThickness(r?.thickness ?? f.thickness ?? 'normal'),
    align: normalizeAlign(r?.align ?? f.align ?? 'left'),
  };
}

function normalizeSections(arr) {
  const list = Array.isArray(arr) ? arr : [];
  const byKey = new Map(CASHIER_SECTION_DEFAULTS.map((x) => [x.key, x]));
  const out = [];
  for (const raw of list) {
    const fb = byKey.get(String(raw?.key ?? '')) || null;
    const row = normalizeSectionRow(raw, fb);
    if (row) out.push(row);
  }
  // missing defaults -> append
  const present = new Set(out.map((x) => x.key));
  for (const d of CASHIER_SECTION_DEFAULTS) {
    if (!present.has(d.key)) out.push(normalizeSectionRow(d, d));
  }
  const order = CASHIER_SECTION_DEFAULTS.map((x) => x.key);
  out.sort((a, b) => {
    const ia = order.indexOf(a.key);
    const ib = order.indexOf(b.key);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  return out;
}

function mergeDesign(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const out = JSON.parse(JSON.stringify(DEFAULT_DESIGN));

  // yeni preset formatını da saxla (fallback: md/normal)
  out.cashier.preset.size = normalizePresetSize(d.cashier?.preset?.size ?? out.cashier.preset.size);
  out.cashier.preset.thickness = normalizeThickness(d.cashier?.preset?.thickness ?? out.cashier.preset.thickness);
  out.cashier.sections = normalizeSections(d.cashier?.sections ?? d.cashier?.Sections);

  // köhnə formatdan (width/padding/fontSize) gələnləri də qəbul edək
  out.cashier.companyFontPx = safeNum(d.cashier?.companyFontPx, out.cashier.companyFontPx);
  out.cashier.metaFontPx = safeNum(d.cashier?.metaFontPx, out.cashier.metaFontPx);
  out.cashier.tableFontPx = safeNum(d.cashier?.tableFontPx, out.cashier.tableFontPx);
  out.cashier.itemsFontPx = safeNum(
    d.cashier?.itemsFontPx ?? d.cashier?.fontSizePx,
    out.cashier.itemsFontPx
  );
  out.cashier.totalsFontPx = safeNum(d.cashier?.totalsFontPx, out.cashier.totalsFontPx);
  out.cashier.grandTotalFontPx = safeNum(d.cashier?.grandTotalFontPx, out.cashier.grandTotalFontPx);
  out.cashier.footerFontPx = safeNum(d.cashier?.footerFontPx, out.cashier.footerFontPx);
  out.cashier.lineHeight = safeNum(d.cashier?.lineHeight, out.cashier.lineHeight);

  const kIn = d.kitchen && typeof d.kitchen === 'object' ? d.kitchen : {};
  out.kitchen = {
    sections: normalizeKitchenSections(kIn.sections ?? kIn.Sections),
    lan: {
      escPosCompact: kIn.lan?.escPosCompact === true || kIn.lan?.EscPosCompact === true,
    },
  };

  return out;
}

function parseCompanyDesignJson(json) {
  if (!json || typeof json !== 'string') return JSON.parse(JSON.stringify(DEFAULT_DESIGN));
  try {
    const raw = JSON.parse(json);
    return mergeDesign(raw);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DESIGN));
  }
}

const DEFAULT_THANK_YOU = 'Təşəkkür edirik';

const ReceiptDesignPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [design, setDesign] = useState(JSON.parse(JSON.stringify(DEFAULT_DESIGN)));
  const [thankYouText, setThankYouText] = useState(DEFAULT_THANK_YOU);
  // yalnız kassa çeki (mətbəx dizaynı bu paneldən çıxarılıb)

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
      setCompany(c);
      setDesign(parseCompanyDesignJson(c?.receiptDesignSettingsJson));
      const ty = String(c?.kassaReceiptThankYouText ?? c?.KassaReceiptThankYouText ?? '').trim();
      setThankYouText(ty || DEFAULT_THANK_YOU);
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
      const derived = deriveLegacyFieldsFromPresets(design);
      const payload = {
        receiptDesignSettingsJson: JSON.stringify(mergeDesign(derived)),
        kassaReceiptThankYouText: thankYouText.trim(),
      };
      await api.put(`/Companies/${companyId}/receipt-design`, payload);
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

  const rightPreview = (
    <div className="sticky top-4 space-y-3">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0ea5e9]/[0.07] to-transparent px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
            <FiPrinter size={20} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Ön baxış</div>
            <div className="truncate text-base font-bold text-slate-900">Kassa çeki (72&nbsp;mm)</div>
          </div>
        </div>
        <div className="bg-gradient-to-b from-slate-50/90 to-slate-100/40 px-4 py-6 sm:px-6">
          <CashierPreviewSections
            design={mergeDesign(design)}
            companyName={company?.nameAz || 'NEOPOS'}
            thankYouPreview={thankYouText.trim() || DEFAULT_THANK_YOU}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn px-3 py-5 md:px-6 md:py-8">
      <Toaster position="bottom-right" />

      <div className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-[#0ea5e9]/[0.04] p-6 shadow-sm ring-1 ring-slate-900/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/25 sm:flex">
              <FiPrinter size={26} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Kassa printer</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Ödəniş çekinin görünüşü: ümumi ölçü, qalınlıq və hər sətirin sırası. USB və ya şəbəkə ilə qoşulan
                ESC/POS printerlərə uyğundur.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
            <button
              type="button"
              onClick={() => setDesign(JSON.parse(JSON.stringify(DEFAULT_DESIGN)))}
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

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Ümumi parametrlər</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Şrift ölçüsü və qalınlıq</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                <FiCheckCircle size={14} />
                Canlı ön baxış
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Ölçü"
                value={design.cashier?.preset?.size || 'md'}
                options={[
                  { value: 'xs', label: 'Çox kiçik' },
                  { value: 'sm', label: 'Kiçik' },
                  { value: 'md', label: 'Orta' },
                  { value: 'lg', label: 'Böyük' },
                ]}
                onChange={(v) =>
                  setDesign({ ...design, cashier: { ...design.cashier, preset: { ...design.cashier.preset, size: v } } })
                }
              />
              <SelectField
                label="Qalınlıq"
                value={design.cashier?.preset?.thickness || 'normal'}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'bold', label: 'Qalın' },
                ]}
                onChange={(v) =>
                  setDesign({
                    ...design,
                    cashier: { ...design.cashier, preset: { ...design.cashier.preset, thickness: v } },
                  })
                }
              />
            </div>

            {/* qeyd blokuna ehtiyac yoxdur */}

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Çekin son sətiri (təşəkkür)
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Bu mətn terminalda kassa çekinin sonunda çap olunur. Boş saxlasanız, standart «{DEFAULT_THANK_YOU}»
                istifadə olunur.
              </p>
              <textarea
                value={thankYouText}
                onChange={(e) => setThankYouText(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={DEFAULT_THANK_YOU}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/15"
              />
            </div>

            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Çek sətirləri</div>
              <p className="mt-1 text-sm text-slate-600">
                Sıra, görünmə, ölçü, qalınlıq və hizalama — dəyişikliklər sağdakı nümunədə dərhal görünür.
              </p>
            </div>

            <CashierSectionsEditor
              sections={design.cashier?.sections || []}
              onChange={(next) =>
                setDesign({
                  ...design,
                  cashier: { ...design.cashier, sections: next },
                })
              }
            />
          </div>

          {/* mətbəx çeki dizaynı bu paneldən çıxarıldı */}
        </div>

        <div className="xl:col-span-5 xl:pt-1">{rightPreview}</div>
      </div>
    </div>
  );
};

export default ReceiptDesignPage;

function CashierSectionsEditor({ sections, onChange }) {
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

function deriveLegacyFieldsFromPresets(design) {
  const next = mergeDesign(design);

  // cashier preset => fontPx
  const cSize = normalizePresetSize(next.cashier?.preset?.size);
  const cPreset = SIZE_PRESETS[cSize] || SIZE_PRESETS.md;
  next.cashier.companyFontPx = cPreset.company;
  next.cashier.metaFontPx = cPreset.meta;
  next.cashier.tableFontPx = cPreset.table;
  next.cashier.itemsFontPx = cPreset.items;
  next.cashier.totalsFontPx = cPreset.totals;
  next.cashier.grandTotalFontPx = cPreset.grand;
  next.cashier.footerFontPx = cPreset.footer;
  next.cashier.lineHeight = cPreset.lh;

  return next;
}

function CashierPreviewSections({ design, companyName, thankYouPreview }) {
  const d = mergeDesign(design);
  const sections = Array.isArray(d?.cashier?.sections) ? d.cashier.sections : CASHIER_SECTION_DEFAULTS;
  const now = new Date();
  const dt = now.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const sizeToPx = (s) => (s === 'xs' ? 10 : s === 'sm' ? 12 : s === 'lg' ? 18 : 14);
  const weight = (t) => (t === 'bold' ? 900 : 700);
  const align = (a) => (a === 'center' || a === 'right' ? a : 'left');
  const line = (text, row) => {
    if (!text || row?.enabled === false) return null;
    return (
      <div
        style={{
          fontSize: `${sizeToPx(row?.size)}px`,
          fontWeight: weight(row?.thickness),
          textAlign: align(row?.align),
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
    companyName,
    checkNumber: '0042',
    printDate: dt.replace(' ', ' -- '),
    waiter: 'Əli Məmmədov',
    customer: 'Müştəri',
    guests: '5',
    hall: 'VIP Zal',
    table: 'Masa 5',
    openTime: '2026-05-08 14:43',
    closeTime: '2026-05-08 14:43',
    items: [
      { name: 'Çay', qty: '2', price: '0.75', total: '1.50' },
      { name: 'Nahar yeməyi', qty: '3', price: '0.75', total: '4.50' },
      { name: 'Qəhvə', qty: '1', price: '0.75', total: '0.75' },
    ],
    itemsTotal: '6.75',
    service: '0.00',
    deposit: '0.00',
    discount: '0.00',
    grandTotal: '6.75',
    extra: thankYouPreview || DEFAULT_THANK_YOU,
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
          lineHeight: d.cashier?.lineHeight || 1.45,
          border: '1px dashed #e2e8f0',
          borderRadius: 12,
        }}
      >
        {sections.map((row, idx) => {
          const k = String(row?.key || '');
          if (row?.enabled === false) return null;
          if (k === 'companyName') return <React.Fragment key={idx}>{line(sample.companyName, row)}</React.Fragment>;
          if (k === 'checkNumber') return <React.Fragment key={idx}>{line(`Cek No : ${sample.checkNumber}`, row)}</React.Fragment>;
          if (k === 'printDate') return <React.Fragment key={idx}>{line(sample.printDate, row)}</React.Fragment>;
          if (k === 'waiter') return <React.Fragment key={idx}>{line(`Ofisiant: ${sample.waiter}`, row)}</React.Fragment>;
          if (k === 'customer') return <React.Fragment key={idx}>{line(`Müştəri: ${sample.customer}`, row)}</React.Fragment>;
          if (k === 'guests') return <React.Fragment key={idx}>{line(`Qonaq sayı: ${sample.guests}`, row)}</React.Fragment>;
          if (k === 'hall') return <React.Fragment key={idx}>{line(`Zal: ${sample.hall}`, row)}</React.Fragment>;
          if (k === 'table') return <React.Fragment key={idx}>{line(`Masa: ${sample.table}`, row)}</React.Fragment>;
          if (k === 'openTime') return <React.Fragment key={idx}>{line(`Açılış tarixi: ${sample.openTime}`, row)}</React.Fragment>;
          if (k === 'closeTime') return <React.Fragment key={idx}>{line(`Bağlanış tarixi: ${sample.closeTime}`, row)}</React.Fragment>;
          if (k === 'items') {
            return (
              <div key={idx} style={{ marginTop: 6 }}>
                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', display: 'flex', fontWeight: 900, fontSize: `${sizeToPx(row?.size)}px` }}>
                  <div style={{ width: '40%' }}>Məhsul</div>
                  <div style={{ width: '15%', textAlign: 'center' }}>Miq</div>
                  <div style={{ width: '20%', textAlign: 'right' }}>Qiym</div>
                  <div style={{ width: '25%', textAlign: 'right' }}>Cəm</div>
                </div>
                {sample.items.map((x, i) => (
                  <div key={i} style={{ display: 'flex', padding: '4px 0', fontSize: `${sizeToPx(row?.size)}px`, fontWeight: weight(row?.thickness) }}>
                    <div style={{ width: '40%' }}>{x.name}</div>
                    <div style={{ width: '15%', textAlign: 'center' }}>{x.qty}</div>
                    <div style={{ width: '20%', textAlign: 'right' }}>{x.price}</div>
                    <div style={{ width: '25%', textAlign: 'right' }}>{x.total}</div>
                  </div>
                ))}
              </div>
            );
          }
          if (k === 'itemsTotal') return <React.Fragment key={idx}>{line(`Məhsulların cəmi: ${sample.itemsTotal}`, row)}</React.Fragment>;
          if (k === 'service') return <React.Fragment key={idx}>{line(`Servis haqqı: ${sample.service}`, row)}</React.Fragment>;
          if (k === 'deposit') return <React.Fragment key={idx}>{line(`Depozit: ${sample.deposit}`, row)}</React.Fragment>;
          if (k === 'discount') return <React.Fragment key={idx}>{line(`Endirim: ${sample.discount}`, row)}</React.Fragment>;
          if (k === 'grandTotal') return <React.Fragment key={idx}>{line(`Yekun: ${sample.grandTotal}`, row)}</React.Fragment>;
          if (k === 'extra') return <React.Fragment key={idx}>{line(sample.extra, row)}</React.Fragment>;
          return null;
        })}
      </div>
    </div>
  );
}
