/** "3:00", "1:30", "3" → dəqiqə */
export function parseTableHourLimitInput(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (s.includes(':')) {
    const [hPart, mPart] = s.split(':');
    const h = Math.max(0, Math.trunc(Number(hPart) || 0));
    const m = Math.max(0, Math.min(59, Math.trunc(Number(mPart) || 0)));
    const total = h * 60 + m;
    return total > 0 ? total : null;
  }
  const onlyH = Math.trunc(Number(s));
  return onlyH > 0 ? onlyH * 60 : null;
}

/** 180 → "3:00" */
export function formatTableHourLimitMinutes(minutes) {
  const m = Math.trunc(Number(minutes) || 0);
  if (m <= 0) return '';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, '0')}`;
}
