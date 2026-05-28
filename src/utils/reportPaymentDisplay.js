import { extractCustomPaymentTotals } from './reportCustomPaymentTotals';

/** Hesabat: nağd/kart cəmlərinə xidmət daxil (xidmət ayrıca sətirdə qalır). Server `NaqdKartReportGross` ilə uyğundur. */

function pickNum(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] != null) return Number(obj[k]);
  }
  return 0;
}

export function grossPaymentTotalsFromReport(report) {
  const totRev = pickNum(report, 'TotalRevenue', 'totalRevenue');
  const totCash = pickNum(report, 'TotalCash', 'totalCash');
  const totCard = pickNum(report, 'TotalCard', 'totalCard');
  const svcRev = pickNum(report, 'ServiceFeeRevenue', 'serviceFeeRevenue');
  const paid = totCash + totCard;
  const EPS = 0.02;

  if (paid <= EPS || svcRev <= EPS) return { cash: totCash, card: totCard };

  if (Math.abs(paid + svcRev - totRev) <= EPS) {
    if (totCard <= EPS) return { cash: totRev, card: 0 };
    const share = totCash / paid;
    return {
      cash: totCash + svcRev * share,
      card: totCard + svcRev * (1 - share),
    };
  }

  return { cash: totCash, card: totCard };
}

/** Növbə kartı (bəzən `serviceFeeRevenue` olmur): nağd+kart < yekun → xidmət nağda. */
export function grossPaymentTotalsFromShiftLike(obj) {
  const rev = pickNum(obj, 'TotalRevenue', 'totalRevenue');
  const cash = pickNum(obj, 'TotalCash', 'totalCash');
  const card = pickNum(obj, 'TotalCard', 'totalCard');
  const svc = pickNum(obj, 'ServiceFeeRevenue', 'serviceFeeRevenue');

  if (svc > 0) {
    return grossPaymentTotalsFromReport({
      totalRevenue: rev,
      totalCash: cash,
      totalCard: card,
      serviceFeeRevenue: svc,
    });
  }

  const paid = cash + card;
  const EPS = 0.02;
  if (rev > paid + EPS) {
    const gap = rev - paid;
    return grossPaymentTotalsFromReport({
      totalRevenue: rev,
      totalCash: cash,
      totalCard: card,
      serviceFeeRevenue: gap,
    });
  }

  return { cash, card };
}

/** Nağd + kart + əlavə üsullar = yekun gəlir (növbə kartı, dashboard). */
export function reconcileShiftPaymentDisplay(shiftOrReport) {
  const rev = pickNum(shiftOrReport, 'TotalRevenue', 'totalRevenue');
  const gross = grossPaymentTotalsFromShiftLike(shiftOrReport);
  const customSum = extractCustomPaymentTotals(shiftOrReport).reduce(
    (s, r) => s + (Number(r.amount) || 0),
    0,
  );
  let cash = gross.cash;
  let card = gross.card;
  const gap = rev - cash - card - customSum;
  const EPS = 0.02;
  if (gap > EPS) {
    if (card <= EPS) cash += gap;
    else {
      const d = cash + card;
      const sh = d > 0 ? cash / d : 0.5;
      cash += gap * sh;
      card += gap * (1 - sh);
    }
  }
  return { cash, card };
}
