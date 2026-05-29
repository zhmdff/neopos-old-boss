import { Capacitor } from '@capacitor/core';

/** Production web: neopos.az → same-origin /api. APK (Capacitor): baked VITE_API_URL or cloud default. */
export function normalizeApiUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const noTrail = s.replace(/\/+$/, '');
  if (/\/api$/i.test(noTrail)) return noTrail;
  return `${noTrail}/api`;
}

const CLOUD_API_DEFAULT = 'https://neopos.runasp.net/api';

export function isCapacitorNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getEnvApiBaseUrl() {
  return normalizeApiUrl(import.meta.env.VITE_API_URL || '');
}

/** Same API base as axios — use for uploads / image URLs instead of import.meta.env.VITE_API_URL. */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = String(window.location.hostname || '').toLowerCase();
    if (!isCapacitorNative() && (host === 'neopos.az' || host === 'www.neopos.az')) {
      return `${window.location.origin.replace(/\/+$/, '')}/api`;
    }
  }

  const env = getEnvApiBaseUrl();
  if (env) return env;

  return CLOUD_API_DEFAULT;
}

export function getApiOrigin() {
  return String(getApiBaseUrl() || '').replace(/\/?api\/?$/i, '');
}
