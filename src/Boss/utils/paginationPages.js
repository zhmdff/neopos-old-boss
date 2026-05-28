/**
 * Səhifələmə üçün kompakt siyahı: 1 … 4 5 6 … 31
 * @param {number} currentPage 1-based
 * @param {number} totalPages
 * @param {number} delta Cari səhifənin hər iki tərəfində göstəriləcək qonşu səhifə sayı
 * @returns {(number|'ellipsis')[]}
 */
export function getPaginationItems(currentPage, totalPages, delta = 1) {
  const total = Math.max(0, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(currentPage || 1)), Math.max(1, total));
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set();
  pages.add(1);
  pages.add(total);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  if (current <= 3) {
    for (let i = 2; i <= 5; i++) {
      if (i <= total) pages.add(i);
    }
  }
  if (current >= total - 2) {
    for (let i = total - 4; i <= total - 1; i++) {
      if (i >= 1) pages.add(i);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}
