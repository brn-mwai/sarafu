import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';
import { Link } from '@astryxdesign/core/Link';
import { buildSummary } from '@/lib/summary';
import { computeTaxPosition } from '@/lib/tax';
import { kes, pct } from '@/lib/format';
import { CATEGORY_LABEL, type TxnCategory } from '@/lib/types';
import { LedgerTable } from './ledger-table';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const ledger = await convex.query(api.ledger.getLatestLedger, {});

  const today = new Date();
  const s = buildSummary(ledger.transactions, ledger.cashDays, 30, today);
  const tax = computeTaxPosition(s.totalSales, Math.max(1, s.tradingDays / 30), today);

  const empty = ledger.transactions.length === 0 && ledger.cashDays.length === 0;

  const kpis = [
    { label: 'Sales', value: kes(s.totalSales), note: `${kes(s.mpesaSales)} M-Pesa, ${kes(s.cashSales)} cash` },
    { label: 'Costs', value: kes(s.totalCosts), note: `${kes(s.stockCosts)} on stock` },
    { label: 'Profit', value: kes(s.grossProfit), note: `${pct(s.margin)} margin` },
    {
      label: 'Turnover tax',
      value: tax.liable ? kes(tax.totDue) : 'None',
      note: tax.liable ? `due ${tax.nextFilingDate}` : 'below the KES 1M floor',
    },
  ];

  const rows = ledger.transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 40)
    .map((t) => ({
      id: t._id,
      date: t.date,
      counterparty: t.counterparty,
      category: CATEGORY_LABEL[t.category as TxnCategory] ?? t.category,
      direction: t.direction === 'in' ? 'In' : 'Out',
      amount: kes(t.amount),
    }));

  return (
    <VStack gap={6} padding={6} maxWidth={1100} hAlign="stretch">
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Heading level={1}>Sarafu</Heading>
          <Link href="/">Home</Link>
        </HStack>
        <Text type="supporting" color="secondary">
          {empty
            ? 'No ledger yet. Send an M-Pesa statement to the Telegram bot and this fills in.'
            : `Last 30 days &middot; ${s.from} to ${s.to}`}
        </Text>
      </VStack>

      <Grid columns={{ minWidth: 220 }} gap={3}>
        {kpis.map((k) => (
          <Card key={k.label} padding={4}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                {k.label}
              </Text>
              <Heading level={2} type="display-3">
                {k.value}
              </Heading>
              <Text type="supporting" color="secondary">
                {k.note}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>

      {!s.complete && !empty ? (
        <Card padding={4} variant="muted">
          <VStack gap={1}>
            <Text>
              {s.cashDaysMissing} trading days have no cash figure. Profit and tax below are
              incomplete until those are entered.
            </Text>
            <Text type="supporting" color="secondary">
              Sarafu shows an incomplete number rather than a confident wrong one.
            </Text>
          </VStack>
        </Card>
      ) : null}

      <Divider />

      <Grid columns={{ minWidth: 300 }} gap={3}>
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Top customers</Heading>
            {s.topCustomers.length === 0 ? (
              <Text type="supporting" color="secondary">
                Nothing yet.
              </Text>
            ) : (
              s.topCustomers.map((c) => (
                <HStack key={c.name} gap={3} vAlign="center" justify="between">
                  <Text>{c.name}</Text>
                  <Text type="supporting" color="secondary">
                    {kes(c.total)} &middot; {c.count}x
                  </Text>
                </HStack>
              ))
            )}
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Where money went</Heading>
            {s.topCosts.length === 0 ? (
              <Text type="supporting" color="secondary">
                Nothing yet.
              </Text>
            ) : (
              s.topCosts.map((c) => (
                <HStack key={c.category} gap={3} vAlign="center" justify="between">
                  <Text>{CATEGORY_LABEL[c.category as TxnCategory] ?? c.category}</Text>
                  <Text type="supporting" color="secondary">
                    {kes(c.total)}
                  </Text>
                </HStack>
              ))
            )}
          </VStack>
        </Card>
      </Grid>

      <Card padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Tax position</Heading>
          <Text>{tax.reason}</Text>
          <Text type="supporting" color="secondary">
            Turnover tax is 1.5% of gross sales, due by the 20th of the following month. This is a
            working figure, not a filed return.
          </Text>
        </VStack>
      </Card>

      <Divider />

      <VStack gap={3}>
        <Heading level={3}>Ledger</Heading>
        <LedgerTable rows={rows} />
      </VStack>
    </VStack>
  );
}
