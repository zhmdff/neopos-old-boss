/** Production: neopos.az → eyni origin /api (IIS reverse proxy). Dev: .env VITE_API_URL. */
export function normalizeApiUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const noTrail = s.replace(/\/+$/, "");
  if (/\/api$/i.test(noTrail)) return noTrail;
  return `${noTrail}/api`;
}

export function getEnvApiBaseUrl() {
  return normalizeApiUrl(import.meta.env.VITE_API_URL || "");
}

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "neopos.az" || host === "www.neopos.az") {
      return `${window.location.origin.replace(/\/+$/, "")}/api`;
    }
  }
  const env = getEnvApiBaseUrl();
  return env || "http://localhost:5050/api";
}

export function getApiOrigin() {
  return String(getApiBaseUrl() || "").replace(/\/?api\/?$/i, "");
}
