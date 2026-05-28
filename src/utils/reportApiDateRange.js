/**
 * Hesabat API-si: datetime-local mətni biznes divar saatı (UTC+4) kimi qəbul edib offset verir.
 * Terminal ilə eyni format.
 * @param {string} input YYYY-MM-DDTHH:mm
 * @returns {string | null} məs. 2026-05-02T12:44:00+04:00
 */
export function bakuWallInputToApiDateTime(input) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(input || '').trim());
  if (!m) return null;
  const y = m[1];
  const mo = m[2];
  const d = m[3];
  const h = m[4];
  const min = m[5];
  const sec = m[6] != null && m[6] !== '' ? m[6] : '00';
  return `${y}-${mo}-${d}T${h}:${min}:${sec}+04:00`;
}
