export const TOT_RATE = 0.015;
export const TOT_FLOOR = 1_000_000;
export const TOT_CEILING = 25_000_000;
export const VAT_THRESHOLD = 5_000_000;
export const FILING_DAY = 20;

export interface TaxPosition {
  grossSales: number;
  annualisedSales: number;
  liable: boolean;
  reason: string;
  totDue: number;
  nextFilingDate: string;
  daysToFiling: number;
  approachingVat: boolean;
  headroomToVat: number;
}

function nextFilingDate(from: Date): Date {
  const due = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), FILING_DAY));
  if (from.getUTCDate() > FILING_DAY) {
    due.setUTCMonth(due.getUTCMonth() + 1);
  }
  return due;
}

export function computeTaxPosition(
  monthlyGrossSales: number,
  monthsObserved: number,
  today: Date,
): TaxPosition {
  const annualisedSales =
    monthsObserved > 0 ? (monthlyGrossSales / monthsObserved) * 12 : 0;

  const due = nextFilingDate(today);
  const daysToFiling = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);

  const belowFloor = annualisedSales < TOT_FLOOR;
  const aboveCeiling = annualisedSales > TOT_CEILING;

  let reason: string;
  if (belowFloor) {
    reason = `Annualised turnover is KES ${Math.round(annualisedSales).toLocaleString()}, below the KES 1,000,000 turnover tax floor. No turnover tax is due.`;
  } else if (aboveCeiling) {
    reason = `Annualised turnover is KES ${Math.round(annualisedSales).toLocaleString()}, above the KES 25,000,000 turnover tax ceiling. Turnover tax does not apply; this business falls under corporation or income tax.`;
  } else {
    reason = `Annualised turnover is KES ${Math.round(annualisedSales).toLocaleString()}, inside the KES 1,000,000 to 25,000,000 turnover tax band.`;
  }

  const liable = !belowFloor && !aboveCeiling;

  return {
    grossSales: monthlyGrossSales,
    annualisedSales,
    liable,
    reason,
    totDue: liable ? monthlyGrossSales * TOT_RATE : 0,
    nextFilingDate: due.toISOString().slice(0, 10),
    daysToFiling,
    approachingVat: annualisedSales >= VAT_THRESHOLD * 0.8,
    headroomToVat: Math.max(0, VAT_THRESHOLD - annualisedSales),
  };
}
