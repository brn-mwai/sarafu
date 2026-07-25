import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';

const STATS = [
  { value: '5.85M', label: 'unlicensed MSMEs in Kenya, with no books at all' },
  { value: '60-70%', label: 'fail within three years, poor records a leading cause' },
  { value: 'USD 19.3B', label: 'MSME financing gap they cannot reach without records' },
];

const STEPS = [
  {
    title: 'Paste your M-Pesa statement',
    body: 'Into Telegram. No paybill, no till, no API, no accountant. Claude reads it and gives every line a business meaning.',
  },
  {
    title: 'Send one cash number a day',
    body: 'Not one entry per sale. Just "cash today 3400". Cash is the half of an informal business nobody else can see.',
  },
  {
    title: 'Ask how you are doing',
    body: 'Sales, costs, margin, top customers. Then ask what you owe KRA, and get a report you can forward to a lender.',
  },
];

export default function Home() {
  return (
    <VStack gap={8} padding={6} maxWidth={960} hAlign="stretch">
      <VStack gap={3}>
        <Heading level={1} type="display-2">
          Sarafu
        </Heading>
        <Text type="supporting" color="secondary">
          AI Mashinani 2026 &middot; Biashara track
        </Text>
        <Heading level={2}>
          Financial visibility for the 5.85 million Kenyan businesses that have no books.
        </Heading>
        <Text>
          A shopkeeper knows money came in today. She cannot tell you whether she made a profit this
          month. Sarafu is a bookkeeper she talks to on Telegram.
        </Text>
      </VStack>

      <Grid columns={{ minWidth: 240 }} gap={3}>
        {STATS.map((s) => (
          <Card key={s.label} padding={4}>
            <VStack gap={1}>
              <Heading level={3} type="display-3">
                {s.value}
              </Heading>
              <Text type="supporting" color="secondary">
                {s.label}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>

      <Divider />

      <VStack gap={4}>
        <Heading level={2}>How it works</Heading>
        <Grid columns={{ minWidth: 260 }} gap={3}>
          {STEPS.map((s, i) => (
            <Card key={s.title} padding={4}>
              <VStack gap={2}>
                <Text type="supporting" color="secondary">
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Heading level={3}>{s.title}</Heading>
                <Text>{s.body}</Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>

      <Divider />

      <VStack gap={3}>
        <Heading level={2}>Turnover tax, as a by-product</Heading>
        <Text>
          She does not want to do tax. She wants to know if she made money. Sarafu computes turnover
          tax at 1.5% of gross sales, flags the KES 1,000,000 floor and the KES 25,000,000 ceiling,
          counts down to the 20th, and warns her before she crosses the KES 5,000,000 line where VAT
          and eTIMS obligations start.
        </Text>
        <HStack gap={4} wrap="wrap">
          <Link href="/dashboard">Open the dashboard</Link>
          <Link href="https://github.com/brn-mwai/sarafu">Source and proposal</Link>
        </HStack>
      </VStack>
    </VStack>
  );
}
