import Anthropic from '@anthropic-ai/sdk';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { SARAFU_SYSTEM_PROMPT, TOOLS } from './agent-tools';
import { buildSummary } from './summary';
import { computeTaxPosition } from './tax';
import { kes, pct } from './format';
import { addDays, daysUntil, reconcile, OBJECTION_WINDOW_DAYS } from './kra';

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
  currentFileId?: string,
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

  if (name === 'log_entry') {
    const transactions = input.entries.map((e: any) => ({
      date: e.date,
      counterparty: e.description,
      direction: e.direction,
      amount: e.amount,
      category: e.category,
      isRevenue: e.isRevenue,
      source: e.paidInCash ? ('cash' as const) : ('mpesa' as const),
    }));

    const { inserted } = await convex.mutation(api.ledger.addTransactions, {
      chatId,
      transactions,
    });

    const inTotal = transactions
      .filter((t: any) => t.direction === 'in')
      .reduce((s: number, t: any) => s + t.amount, 0);
    const outTotal = transactions
      .filter((t: any) => t.direction === 'out')
      .reduce((s: number, t: any) => s + t.amount, 0);

    return {
      recorded: inserted,
      moneyIn: kes(inTotal),
      moneyOut: kes(outTotal),
      todaysMargin: inTotal > 0 ? kes(inTotal - outTotal) : 'No sales in this entry',
      lines: transactions.map(
        (t: any) => `${t.counterparty}: ${t.direction === 'in' ? '+' : '-'}${kes(t.amount)} (${t.category})`,
      ),
      instruction:
        'Confirm back in one short line what you recorded and the resulting profit for that day. Do not restate every line unless she asks.',
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

  if (name === 'save_document') {
    const { documentId } = await convex.mutation(api.kra.saveDocument, {
      chatId,
      kind: input.kind,
      telegramFileId: currentFileId ?? 'unknown',
      summary: input.summary,
      docDate: input.docDate,
      amount: input.amount,
    });
    return {
      filed: input.kind,
      documentId,
      note: 'This is now on file as evidence. It counts if KRA ever assesses her for this period.',
    };
  }

  if (name === 'record_kra_assessment') {
    const deadline = addDays(input.servedDate, OBJECTION_WINDOW_DAYS);
    const left = daysUntil(deadline, today);

    await convex.mutation(api.kra.recordAssessment, {
      chatId,
      reference: input.reference,
      taxType: input.taxType,
      assessedAmount: input.assessedAmount,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      servedDate: input.servedDate,
      objectionDeadline: deadline,
    });

    return {
      recorded: `${input.taxType} assessment of ${kes(input.assessedAmount)}`,
      period: `${input.periodFrom} to ${input.periodTo}`,
      objectionDeadline: deadline,
      daysLeftToObject: left,
      urgent: left <= 10,
      rule: 'A Notice of Objection must reach the Commissioner within 30 days of being served, under section 51 of the Tax Procedures Act. Late objections need good cause, and not knowing the deadline does not count.',
      instruction:
        left <= 0
          ? 'The 30 day window has passed. Tell her plainly and say a late objection needs good cause.'
          : 'Lead with the number of days she has left. Then offer to check the figure against her records.',
    };
  }

  if (name === 'reconcile_kra' || name === 'build_dispute_pack') {
    const from: string = input.periodFrom;
    const to: string = input.periodTo;

    const inPeriod = ledger.transactions.filter((t) => t.date >= from && t.date <= to);
    const cashInPeriod = ledger.cashDays.filter((c) => c.date >= from && c.date <= to);

    const ledgerSales =
      inPeriod.filter((t) => t.direction === 'in' && t.isRevenue).reduce((s, t) => s + t.amount, 0) +
      cashInPeriod.reduce((s, c) => s + c.amount, 0);

    const spanDays = Math.max(
      1,
      Math.round(
        (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
          86_400_000,
      ) + 1,
    );
    const cashDaysMissing = Math.max(0, spanDays - cashInPeriod.length);

    const docs = await convex.query(api.kra.listDocuments, { chatId });
    const r = reconcile(input.assessedSales, ledgerSales, inPeriod.length, cashDaysMissing);

    const base = {
      period: `${from} to ${to}`,
      kraSaysTurnoverWas: kes(r.kraFigure),
      yourRecordsShow: kes(r.ourFigure),
      difference: kes(Math.abs(r.variance)),
      whoIsHigher:
        r.direction === 'kra_higher'
          ? 'KRA assessed more than her records show'
          : r.direction === 'we_higher'
            ? 'Her records show more than KRA assessed'
            : 'They match',
      transactionsOnRecord: r.evidenceLines,
      supportingDocuments: docs.length,
      cashDaysMissing: r.cashDaysMissing,
      recordsAreComplete: r.defensible,
    };

    if (name === 'reconcile_kra') {
      return {
        ...base,
        advice: r.defensible
          ? 'Her records are complete for this period, so the variance is defensible. Objecting is reasonable.'
          : `Her records have ${r.cashDaysMissing} days with no cash figure. KRA will treat gaps as undeclared sales. Tell her to fill those days before objecting, because an incomplete ledger weakens the objection.`,
        instruction:
          'Give her the two numbers and the gap in one line each. Then say plainly whether her records can defend an objection.',
      };
    }

    return {
      ...base,
      groundsGiven: input.grounds ?? null,
      documentsOnFile: docs.map((d) => `${d.kind}: ${d.summary}`),
      statutoryBasis:
        'Section 51 of the Tax Procedures Act. Objection within 30 days of service. The Commissioner must decide within 60 days or the objection is deemed allowed. Appeal to the Tax Appeals Tribunal within 30 days of the objection decision, and undisputed tax must be paid or an arrangement made before appealing.',
      instruction:
        'Draft the Notice of Objection. Formal but plain English. State the assessment being objected to, the period, the figure KRA used, the figure her records show, how many transactions and documents support it, and the grounds. End with what she should attach. If her records are incomplete, say so inside the draft rather than hiding it.',
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

export interface Attachment {
  kind: 'image' | 'pdf';
  mediaType: string;
  base64: string;
  telegramFileId: string;
}

export async function runAgent(
  chatId: string,
  userText: string,
  attachment?: Attachment,
): Promise<string> {
  const today = new Date();

  const history = await convex.query(api.ledger.getHistory, {
    chatId,
    limit: HISTORY_LIMIT,
  });

  const userContent: Anthropic.ContentBlockParam[] = [];

  if (attachment) {
    if (attachment.kind === 'image') {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: attachment.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
          data: attachment.base64,
        },
      });
    } else {
      userContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: attachment.base64 },
      });
    }
  }

  userContent.push({ type: 'text', text: userText });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: 'user', content: userContent },
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
        const out = await runTool(
          chatId,
          call.name,
          call.input,
          today,
          attachment?.telegramFileId,
        );
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
