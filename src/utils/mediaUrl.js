import { getApiOrigin } from './apiBaseUrl';

/** Cloudflare köhnə HTML cache-i üçün — deploy-da artır. */
const UPLOADS_CACHE_VERSION = '1';

/** DB-də bəzən localhost və ya tam URL saxlanır — /uploads/... hissəsini çıxarırıq. */
function extractUploadPath(raw) {
  const s = String(raw || '').trim().replace(/\\/g, '/');
  if (!s) return null;
  const fromUrl = s.match(/\/uploads\/[^?#]*/i);
  if (fromUrl) return fromUrl[0];
  if (/^uploads\//i.test(s)) return `/${s.split(/[?#]/)[0]}`;
  if (s.startsWith('/uploads/')) return s.split(/[?#]/)[0];
  return null;
}

/** Serverdən gələn path (məs. /uploads/...) → tam URL. Artıq http(s) olarsa olduğu kimi. */
export function mediaUrl(path) {
  if (path == null) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  const uploadPath = extractUploadPath(raw);
  if (uploadPath) {
    const base = getApiOrigin().replace(/\/$/, '');
    const url = base ? `${base}${uploadPath}` : uploadPath;
    return `${url}?v=${UPLOADS_CACHE_VERSION}`;
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  const rel = raw.startsWith('/') ? raw : `/${raw}`;
  const base = getApiOrigin().replace(/\/$/, '');
  return base ? `${base}${rel}` : rel;
}
