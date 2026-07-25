import Anthropic from '@anthropic-ai/sdk';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { SARAFU_SYSTEM_PROMPT, TOOLS } from './agent-tools';
import { buildSummary } from './summary';
import { computeTaxPosition } from './tax';
import { kes, pct } from './format';

const MODEL = 'claude-sonnet-5';
const MAX_TURNS = 6;
const HISTORY_LIMIT = 12;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ToolResult = Record<string, unknown>;

async function runTool(
  chatId: string,
  name: string,
  input: any,
  today: Date,
): Promise<ToolResult> {
  if (name === 'parse_statement') {
    const { inserted } = await convex.mutation(api.ledger.addTransactions, {
      chatId,
      transactions: input.transactions,
    });
    const sales = input.transactions
      .filter((t: any) => t.isRevenue)
      .reduce((s: number, t: any) => s + t.amount, 0);
    const costs = input.transactions
      .filter((t: any) => t.direction === 'out' && t.category !== 'transfer')
      .reduce((s: number, t: any) => s + t.amount, 0);
    return {
      imported: inserted,
      period: `${input.periodStart} to ${input.periodEnd}`,
      mpesaSales: kes(sales),
      costs: kes(costs),
      note: 'Cash sales are not in this figure. Ask her for a cash number to complete the picture.',
    };
  }

  if (name === 'log_cash') {
    const res = await convex.mutation(api.ledger.logCash, {
      chatId,
      date: input.date,
      amount: input.amount,
    });
    return {
      recorded: kes(input.amount),
      date: input.date,
      replacedPrevious: res.replaced ? kes(res.previous ?? 0) : null,
    };
  }

  const ledger = await convex.query(api.ledger.getLedger, { chatId });

  if (name === 'get_summary') {
    const s = buildSummary(ledger.transactions, ledger.cashDays, input.days ?? 30, today);
    return {
      period: `${s.from} to ${s.to}`,
      salesFromMpesa: kes(s.mpesaSales),
      salesFromCash: kes(s.cashSales),
      totalSales: kes(s.totalSales),
      totalCosts: kes(s.totalCosts),
      spentOnStock: kes(s.stockCosts),
      profit: kes(s.grossProfit),
      margin: pct(s.margin),
      topCustomers: s.topCustomers.map((c) => `${c.name}: ${kes(c.total)} over ${c.count} payments`),
      biggestCosts: s.topCosts.map((c) => `${c.category}: ${kes(c.total)}`),
      cashDaysMissing: s.cashDaysMissing,
      dataComplete: s.complete,
      warning: s.complete
        ? null
        : `${s.cashDaysMissing} days have no cash figure. Say this plainly; the profit number is incomplete until she fills them.`,
    };
  }

  if (name === 'generate_report') {
    const months = Math.max(1, input.months ?? 1);
    const days = Math.round(months * 30);
    const s = buildSummary(ledger.transactions, ledger.cashDays, days, today);
    const prior = buildSummary(ledger.transactions, ledger.cashDays, days * 2, today);
    const priorSales = prior.totalSales - s.totalSales;
    const t = computeTaxPosition(s.totalSales, Math.max(1, s.tradingDays / 30), today);

    const byDay = new Map<string, number>();
    for (const tx of ledger.transactions) {
      if (tx.direction !== 'in' || !tx.isRevenue) continue;
      byDay.set(tx.date, (byDay.get(tx.date) ?? 0) + tx.amount);
    }
    for (const c of ledger.cashDays) {
      byDay.set(c.date, (byDay.get(c.date) ?? 0) + c.amount);
    }
    const ranked = [...byDay.entries()].sort((a, b) => b[1] - a[1]);

    return {
      period: `${s.from} to ${s.to}`,
      salesFromMpesa: kes(s.mpesaSales),
      salesFromCash: kes(s.cashSales),
      totalSales: kes(s.totalSales),
      totalCosts: kes(s.totalCosts),
      spentOnStock: kes(s.stockCosts),
      profit: kes(s.grossProfit),
      margin: pct(s.margin),
      priorPeriodSales: priorSales > 0 ? kes(priorSales) : 'No earlier data',
      changeOnPriorPeriod:
        priorSales > 0 ? pct((s.totalSales - priorSales) / priorSales) : 'Not comparable yet',
      bestDay: ranked[0] ? `${ranked[0][0]}: ${kes(ranked[0][1])}` : 'Not enough data',
      worstDay: ranked.length > 1 ? `${ranked[ranked.length - 1][0]}: ${kes(ranked[ranked.length - 1][1])}` : 'Not enough data',
      topCustomers: s.topCustomers.map((c) => `${c.name}: ${kes(c.total)} over ${c.count} payments`),
      biggestCosts: s.topCosts.map((c) => `${c.category}: ${kes(c.total)}`),
      turnoverTaxDue: t.liable ? kes(t.totDue) : 'None, below the KES 1,000,000 floor',
      annualisedTurnover: kes(t.annualisedSales),
      cashDaysMissing: s.cashDaysMissing,
      dataComplete: s.complete,
      instruction:
        'Write this as a short report she could forward to a lender or her chama. Lead with sales, profit and margin. Name the top customer and the biggest cost. If cash days are missing, say so in one line near the top, not buried at the end.',
    };
  }

  if (name === 'get_tax_position') {
    const s = buildSummary(ledger.transactions, ledger.cashDays, 30, today);
    const months = Math.max(1, s.tradingDays / 30);
    const t = computeTaxPosition(s.totalSales, months, today);
    return {
      salesThisPeriod: kes(s.totalSales),
      annualisedTurnover: kes(t.annualisedSales),
      liableForTurnoverTax: t.liable,
      explanation: t.reason,
      turnoverTaxDue: t.liable ? kes(t.totDue) : 'None',
      rateUsed: '1.5% of gross sales',
      nextFilingDate: t.nextFilingDate,
      daysUntilFiling: t.daysToFiling,
      approachingVatLine: t.approachingVat,
      headroomBeforeVat: kes(t.headroomToVat),
      cashDaysMissing: s.cashDaysMissing,
      caveat:
        'This is her working figure, not a filed return. It moves with any cash days she has not entered.',
    };
  }

  return { error: `Unknown tool ${name}` };
}

export async function runAgent(chatId: string, userText: string): Promise<string> {
  const today = new Date();

  const history = await convex.query(api.ledger.getHistory, {
    chatId,
    limit: HISTORY_LIMIT,
  });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: 'user', content: userText },
  ];

  await convex.mutation(api.ledger.appendMessage, {
    chatId,
    role: 'user',
    content: userText,
  });

  let reply = '';

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: `${SARAFU_SYSTEM_PROMPT}\n\nToday is ${today.toISOString().slice(0, 10)}.`,
      output_config: { effort: 'low' },
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === 'refusal') {
      return 'I could not process that one. Try rephrasing it.';
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (text) reply = text;

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUses.length === 0) break;

    messages.push({ role: 'assistant', content: response.content });

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const call of toolUses) {
      try {
        const out = await runTool(chatId, call.name, call.input, today);
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: JSON.stringify(out),
        });
      } catch (err) {
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: `Tool failed: ${err instanceof Error ? err.message : String(err)}`,
          is_error: true,
        });
      }
    }
    messages.push({ role: 'user', content: results });
  }

  const final = reply || 'Something went wrong on my side. Send that again.';

  await convex.mutation(api.ledger.appendMessage, {
    chatId,
    role: 'assistant',
    content: final,
  });

  return final;
}
