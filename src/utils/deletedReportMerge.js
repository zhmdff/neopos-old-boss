function pickStr(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).length) return String(obj[k]);
  }
  return '';
}

function pickNum(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) {
      const n = Number(obj[k]);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function orderLineProductLabelRow(row) {
  return pickStr(row, 'lineProductName', 'LineProductName').trim();
}

export function isPlaceholderProductName(s) {
  const t = String(s ?? '')
    .replace(/\u00a0/g, ' ')
    .trim();
  if (!t) return true;
  const core = t.replace(/\s+/g, '');
  if (/^[\-–—−‐‑‒…_.]+$/u.test(core)) return true;
  return false;
}

function normalizeProductMergeKey(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function mergeDeletedReportRows(items, orderRows) {
  const map = new Map();
  const keyOf = (nameNorm, unit) => `${nameNorm}|${Number(unit).toFixed(4)}`;

  const bump = (displayName, nameNorm, unit, addQty) => {
    const add = Number(addQty) || 0;
    if (add <= 0) return;
    const u = Number.isFinite(Number(unit)) ? Number(unit) : 0;
    const k = keyOf(nameNorm, u);
    const prev = map.get(k);
    const label = String(displayName || '').trim();
    if (!prev) {
      if (isPlaceholderProductName(label)) return;
      map.set(k, {
        displayName: label,
        qty: add,
        unit: u,
      });
    } else {
      prev.qty += add;
    }
  };

  const catalog = Array.isArray(items) ? items : [];
  const orders = Array.isArray(orderRows) ? orderRows : [];

  for (const row of catalog) {
    const displayName = pickStr(row, 'nameAz', 'NameAz').trim();
    if (isPlaceholderProductName(displayName)) continue;
    const price = Number(row?.salePrice ?? row?.SalePrice ?? 0);
    bump(displayName, normalizeProductMergeKey(displayName), price, 1);
  }
  for (const row of orders) {
    const displayName = orderLineProductLabelRow(row);
    if (isPlaceholderProductName(displayName)) continue;
    const up = pickNum(row, 'lineUnitPrice', 'LineUnitPrice');
    const q = pickNum(row, 'lineQuantity', 'LineQuantity');
    bump(displayName, normalizeProductMergeKey(displayName), up ?? 0, q ?? 0);
  }

  return Array.from(map.values())
    .filter((r) => Number(r.qty) > 0)
    .filter((r) => !isPlaceholderProductName(r.displayName))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'az', { sensitivity: 'base' }));
}

export function sumDeletedMergedLineTotals(rows) {
  if (!Array.isArray(rows)) return 0;
  let s = 0;
  for (const r of rows) {
    const q = Number(r?.qty) || 0;
    const u = Number(r?.unit) || 0;
    s += q * u;
  }
  return s;
}
