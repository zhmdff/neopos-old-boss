/** Mətbəx slipi: `receiptDesignSettingsJson.kitchen` — kassa çekindəki kimi sətir sırası və stillər. */

export const KITCHEN_SECTION_DEFAULTS = Object.freeze([
  { key: 'printDate', label: 'Cari tarix', enabled: true, size: 'sm', thickness: 'bold', align: 'center' },
  { key: 'workshopName', label: 'Şöbənin adı', enabled: true, size: 'lg', thickness: 'bold', align: 'center' },
  { key: 'waiter', label: 'Ofisiant', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'hall', label: 'Zal', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'table', label: 'Masa', enabled: true, size: 'md', thickness: 'bold', align: 'left' },
  { key: 'openTime', label: 'Masanın açılış tarixi', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
  { key: 'items', label: 'Məhsullar', enabled: true, size: 'sm', thickness: 'normal', align: 'left' },
]);

export function normalizePresetSize(s) {
  return s === 'xs' || s === 'sm' || s === 'md' || s === 'lg' ? s : 'md';
}

export function normalizeThickness(t) {
  return t === 'normal' || t === 'bold' ? t : 'normal';
}

export function normalizeAlign(a) {
  return a === 'left' || a === 'center' || a === 'right' ? a : 'left';
}

function normalizeKitchenSectionRow(r, fallback) {
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

export function normalizeKitchenSections(arr) {
  const list = Array.isArray(arr) ? arr : [];
  const byKey = new Map(KITCHEN_SECTION_DEFAULTS.map((x) => [x.key, x]));
  const out = [];
  for (const raw of list) {
    const fb = byKey.get(String(raw?.key ?? '')) || null;
    const row = normalizeKitchenSectionRow(raw, fb);
    if (row) out.push(row);
  }
  const present = new Set(out.map((x) => x.key));
  for (const d of KITCHEN_SECTION_DEFAULTS) {
    if (!present.has(d.key)) out.push(normalizeKitchenSectionRow(d, d));
  }
  return out;
}

export function defaultKitchenDesignBlock() {
  return {
    sections: normalizeKitchenSections(KITCHEN_SECTION_DEFAULTS),
    lan: { escPosCompact: false },
  };
}
