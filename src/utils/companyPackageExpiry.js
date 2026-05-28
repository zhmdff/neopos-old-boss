/** Bakı təqvimi ilə lisenziya (PackageEndDate) — terminal ilə eyni məntiq. */

export const LICENSE_RENEWAL_PHONE_DISPLAY = '+994 50-573-81-47';
export const LICENSE_RENEWAL_PHONE_TEL = 'tel:+994 50-573-81-47';

export const LICENSE_EXPIRED_MESSAGE_AZ = `Lisenziyanın müddəti bitib. Yeniləmə üçün ${LICENSE_RENEWAL_PHONE_DISPLAY} nömrəsi ilə əlaqə saxlayın.`;

export const LICENSE_MODAL_BODY_AZ = `Lisenziyanı yeniləmək üçün ${LICENSE_RENEWAL_PHONE_DISPLAY} nömrəsi ilə əlaqə saxlayın.`;

function toBakuYmd(d) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Baku',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

function ymdToUtcNoon(ymd) {
  const [y, m, d] = String(ymd).split('-').map((x) => Number(x));
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d, 12, 0, 0);
}

export function getRemainingCalendarDaysBaku(packageEndRaw) {
  if (packageEndRaw == null || packageEndRaw === '') return null;
  const end = packageEndRaw instanceof Date ? packageEndRaw : new Date(packageEndRaw);
  if (Number.isNaN(end.getTime())) return null;
  const endYmd = toBakuYmd(end);
  const todayYmd = toBakuYmd(new Date());
  if (!endYmd || !todayYmd) return null;
  const diffMs = ymdToUtcNoon(endYmd) - ymdToUtcNoon(todayYmd);
  return Math.round(diffMs / 86400000);
}

export function isPackageExpired(packageEndRaw) {
  const d = getRemainingCalendarDaysBaku(packageEndRaw);
  return d != null && d < 0;
}

export function isLicenseBlockedMessage(text) {
  const s = String(text || '').toLowerCase();
  return s.includes('lisenziya') || s.includes('994505738147');
}

export function getLicenseBannerState(packageEndRaw) {
  const days = getRemainingCalendarDaysBaku(packageEndRaw);
  if (days == null || days < 0 || days > 3) return null;
  let tone;
  if (days === 3) tone = 'green';
  else if (days === 2) tone = 'yellow';
  else tone = 'red';
  const label =
    days === 0
      ? 'Lisenziyanın son günüdür!'
      : days === 1
        ? 'Lisenziyaya 1 gün qalıb!'
        : `Lisenziyaya ${days} gün qaldı!`;
  return { days, tone, label };
}

/** Aktiv şirkət üçün bitmə tarixi (çox şirkət + switch). */
export function resolveActiveCompanyPackageEnd(user) {
  if (!user) return null;
  const cid = String(user.companyId || user.CompanyId || '').trim().toLowerCase();
  const list = user.companies || user.Companies;
  if (Array.isArray(list) && list.length > 0) {
    const row =
      (cid &&
        list.find(
          (x) => String(x.companyId || x.CompanyId || '').trim().toLowerCase() === cid,
        )) ||
      list[0];
    const d = row?.packageEndDate ?? row?.PackageEndDate;
    if (d != null && d !== '') return d;
  }
  return user.packageEndDate ?? user.PackageEndDate ?? null;
}
