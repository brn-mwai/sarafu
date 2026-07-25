import type { TxnCategory } from './types';

export interface LedgerTxn {
  date: string;
  counterparty: string;
  direction: 'in' | 'out';
  amount: number;
  category: string;
  isRevenue: boolean;
}

export interface CashDay {
  date: string;
  amount: number;
}

export interface Summary {
  periodDays: number;
  from: string;
  to: string;
  mpesaSales: number;
  cashSales: number;
  totalSales: number;
  totalCosts: number;
  stockCosts: number;
  grossProfit: number;
  margin: number;
  topCustomers: { name: string; total: number; count: number }[];
  topCosts: { category: string; total: number }[];
  tradingDays: number;
  cashDaysLogged: number;
  cashDaysMissing: number;
  complete: boolean;
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

export function buildSummary(
  transactions: LedgerTxn[],
  cashDays: CashDay[],
  days: number,
  today: Date,
): Summary {
  const cutoff = new Date(today.getTime() - days * 86_400_000).toISOString().slice(0, 10);
  const inWindow = transactions.filter((t) => t.date >= cutoff);
  const cashInWindow = cashDays.filter((c) => c.date >= cutoff);

  const dates = inWindow.map((t) => t.date).sort();
  const from = dates[0] ?? cutoff;
  const to = dates[dates.length - 1] ?? today.toISOString().slice(0, 10);

  const mpesaSales = inWindow
    .filter((t) => t.direction === 'in' && t.isRevenue)
    .reduce((s, t) => s + t.amount, 0);

  const cashSales = cashInWindow.reduce((s, c) => s + c.amount, 0);
  const totalSales = mpesaSales + cashSales;

  const costTxns = inWindow.filter((t) => t.direction === 'out' && t.category !== 'transfer');
  const totalCosts = costTxns.reduce((s, t) => s + t.amount, 0);
  const stockCosts = costTxns
    .filter((t) => t.category === 'stock_purchase' || t.category === 'supplier')
    .reduce((s, t) => s + t.amount, 0);

  const customerTotals = new Map<string, { total: number; count: number }>();
  for (const t of inWindow) {
    if (t.direction !== 'in' || !t.isRevenue) continue;
    const prev = customerTotals.get(t.counterparty) ?? { total: 0, count: 0 };
    customerTotals.set(t.counterparty, { total: prev.total + t.amount, count: prev.count + 1 });
  }

  const categoryTotals = new Map<string, number>();
  for (const t of costTxns) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + t.amount);
  }

  const tradingDays = daysBetween(new Date(from), new Date(to));
  const cashDaysLogged = cashInWindow.length;

  return {
    periodDays: days,
    from,
    to,
    mpesaSales,
    cashSales,
    totalSales,
    totalCosts,
    stockCosts,
    grossProfit: totalSales - totalCosts,
    margin: totalSales > 0 ? (totalSales - totalCosts) / totalSales : 0,
    topCustomers: [...customerTotals.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    topCosts: [...categoryTotals.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    tradingDays,
    cashDaysLogged,
    cashDaysMissing: Math.max(0, tradingDays - cashDaysLogged),
    complete: cashDaysLogged >= tradingDays,
  };
}
