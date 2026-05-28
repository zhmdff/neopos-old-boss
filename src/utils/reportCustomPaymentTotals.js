/**
 * API: SummaryReportDto / ShiftReportDto — əlavə ödəniş üsulları cəmləri.
 * @param {unknown} summary
 * @returns {{ name: string, amount: number, orderCount: number }[]}
 */
export function extractCustomPaymentTotals(summary) {
  if (!summary) return [];
  const raw = summary.customPaymentTotals ?? summary.CustomPaymentTotals;
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw
    .map((row) => ({
      name: String(row?.methodName ?? row?.MethodName ?? '').trim() || '—',
      amount: Number(row?.amount ?? row?.Amount ?? 0) || 0,
      orderCount: Math.round(Number(row?.orderCount ?? row?.OrderCount ?? 0)) || 0,
    }))
    .filter((r) => r.amount > 0.0001);
}

export const REPORT_CUSTOM_PAY_RING = [
  'bg-indigo-50 ring-indigo-100 text-indigo-900',
  'bg-rose-50 ring-rose-100 text-rose-900',
  'bg-violet-50 ring-violet-100 text-violet-900',
  'bg-teal-50 ring-teal-100 text-teal-900',
];
