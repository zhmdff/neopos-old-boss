export function normalizeWhatsAppNumber(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  let digits = s.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  // AZ fallback: 0XXXXXXXXX -> 994XXXXXXXXX
  if (digits.length === 10 && digits.startsWith('0')) digits = `994${digits.slice(1)}`;
  // If already 9 digits (e.g. 50xxxxxxx) -> assume AZ
  if (digits.length === 9 && !digits.startsWith('994')) digits = `994${digits}`;
  return digits;
}

export function buildWhatsAppOrderUrl({ phone, message }) {
  const to = normalizeWhatsAppNumber(phone);
  if (!to) return '';
  const text = encodeURIComponent(String(message || ''));
  return `https://wa.me/${to}?text=${text}`;
}

export function formatOrderMessage({ companyName, cartLines, total }) {
  const header = companyName ? `Sifariş — ${companyName}` : 'Sifariş';
  const lines = (cartLines || [])
    .filter((x) => x && x.qty > 0)
    .map((x) => {
      const price = Number(x.price || 0);
      const lineTotal = price * Number(x.qty || 0);
      return `${x.qty}x ${x.name} — ${price.toFixed(2)} ₼ = ${lineTotal.toFixed(2)} ₼`;
    });

  const sum = Number(total || 0);
  return [header, '', ...lines, '', `Cəmi: ${sum.toFixed(2)} ₼`].join('\n');
}

function formatKm(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  return `${n.toFixed(2)} KM`;
}

function safeLine(label, value) {
  const s = String(value || '').trim();
  if (!s) return '';
  return `${label}: ${s}`;
}

export function formatNeoPosDeliveryMessage({
  platformName,
  companyName,
  branchName,
  fullName,
  distanceKm,
  cartLines,
  note,
  phone,
  address,
  userLat,
  userLng,
  includeAddress = true,
  includeLocation = true,
}) {
  const title = `🖥️ ${platformName || 'NeoPos'} - Çatdırılma - 🧺 Səbətim`;

  const totalCount = (cartLines || []).reduce((s, x) => s + (Number(x.qty || 0) || 0), 0);
  const totalPrice = (cartLines || []).reduce((s, x) => s + (Number(x.price || 0) * Number(x.qty || 0) || 0), 0);

  const items = (cartLines || [])
    .filter((x) => x && x.qty > 0)
    .map((x, idx) => {
      const price = Number(x.price || 0);
      return `✅ ${idx + 1}. ${x.name}   QİYMƏTİ: ${price.toFixed(2)} ₼ x ${x.qty}`;
    });

  const maps =
    includeLocation && Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng))
      ? {
          google: `https://www.google.com/maps/place/${Number(userLat)},${Number(userLng)}`,
          waze: `https://waze.com/ul?ll=${Number(userLat)},${Number(userLng)}`,
        }
      : null;

  const noteText = String(note || '').trim() || '(Yoxdur)';

  const out = [
    title,
    '',
    safeLine('Ad soyad', fullName),
    '',
    safeLine('Sifariş olunan filial', branchName || companyName),
    '',
    distanceKm != null ? `Məsafə: ${formatKm(distanceKm)}` : '',
    '',
    'Seçdiyim məhsullar:',
    '',
    ...items,
    '',
    `TOPLAM: ${totalCount} məhsul, ${totalPrice.toFixed(2)} ₼`,
    '',
    '🗒️_Yeməklər haqqında qeydim_:',
    noteText,
    '',
    safeLine('📞Əlaqə telefonu', phone),
    includeAddress ? safeLine('📍Ünvan', address) : '',
    '',
    maps ? '📍Ünvan məlumatları:' : '',
    maps ? `Google Maps: ${maps.google}` : '',
    maps ? `WAZE: ${maps.waze}` : '',
    '',
    '🗒️_Detallar_:',
    '**',
  ]
    .filter(Boolean)
    .join('\n');

  return out;
}

