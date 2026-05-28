const BAKU_TZ = 'Asia/Baku';

function parseIsoNoTzParts(value) {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(s);
  if (!m) return null;
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) return null;
  return {
    year: m[1],
    month: m[2],
    day: m[3],
    hour: m[4],
    minute: m[5],
    second: m[6] || '00',
  };
}

/**
 * NeoPos API: serverdə vaxt çox vaxt "Bakı divar saatı" rəqəmləri `...Z` ilə gəlir.
 * Brauzer UTC kimi oxuyanda +4 sürüşməsinin qarşısını almaq üçün rəqəmləri divar kimi göstəririk.
 */
function parseNeoPosApiIsoAsWallParts(value) {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d{1,7})?(Z|[+-]\d{2}:?\d{2})?$/.exec(s);
  if (!m || !m[7]) return null;
  return {
    year: m[1],
    month: m[2],
    day: m[3],
    hour: m[4],
    minute: m[5],
    second: m[6] || '00',
  };
}

function safeDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function formatParts(d, opts) {
  const parts = new Intl.DateTimeFormat('az-AZ', { timeZone: BAKU_TZ, ...opts }).formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return map;
}

/**
 * API tarixini <input type="datetime-local" /> üçün (terminal ilə eyni).
 * @param {string|number|Date} value
 * @returns {string} YYYY-MM-DDTHH:mm və ya boş
 */
export function apiDateToDatetimeLocalInput(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const noTz = parseIsoNoTzParts(value);
    if (noTz) return `${noTz.year}-${noTz.month}-${noTz.day}T${noTz.hour}:${noTz.minute}`;
    const wall = parseNeoPosApiIsoAsWallParts(value);
    if (wall) return `${wall.year}-${wall.month}-${wall.day}T${wall.hour}:${wall.minute}`;
  }
  const d = safeDate(value);
  if (!d) return '';
  const p = formatParts(d, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function formatBakuDateTime(value) {
  const isoParts = parseIsoNoTzParts(value);
  if (isoParts) return `${isoParts.day}.${isoParts.month}.${isoParts.year} ${isoParts.hour}:${isoParts.minute}`;
  const wall = parseNeoPosApiIsoAsWallParts(value);
  if (wall) return `${wall.day}.${wall.month}.${wall.year} ${wall.hour}:${wall.minute}`;
  const d = safeDate(value) || new Date();
  const p = formatParts(d, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
}
