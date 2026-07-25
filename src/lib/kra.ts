export const OBJECTION_WINDOW_DAYS = 30;
export const COMMISSIONER_DECISION_DAYS = 60;
export const TRIBUNAL_APPEAL_DAYS = 30;

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso: string, today: Date): number {
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.ceil((target - today.getTime()) / 86_400_000);
}

export interface Reconciliation {
  kraFigure: number;
  ourFigure: number;
  variance: number;
  variancePct: number;
  direction: 'kra_higher' | 'we_higher' | 'match';
  defensible: boolean;
  evidenceLines: number;
  cashDaysMissing: number;
}

export function reconcile(
  kraAssessedSales: number,
  ledgerSales: number,
  evidenceLines: number,
  cashDaysMissing: number,
): Reconciliation {
  const variance = kraAssessedSales - ledgerSales;
  const variancePct = ledgerSales > 0 ? variance / ledgerSales : 0;

  return {
    kraFigure: kraAssessedSales,
    ourFigure: ledgerSales,
    variance,
    variancePct,
    direction: variance > 0 ? 'kra_higher' : variance < 0 ? 'we_higher' : 'match',
    defensible: cashDaysMissing === 0 && evidenceLines > 0,
    evidenceLines,
    cashDaysMissing,
  };
}
