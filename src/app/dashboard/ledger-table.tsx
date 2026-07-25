'use client';

import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import type { TableColumn } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';

interface Row extends Record<string, unknown> {
  id: string;
  date: string;
  counterparty: string;
  category: string;
  direction: string;
  amount: string;
}

const columns: TableColumn<Row>[] = [
  { key: 'date', header: 'Date', width: pixel(110) },
  { key: 'counterparty', header: 'Who', width: proportional(1) },
  { key: 'category', header: 'What it was', width: pixel(160) },
  { key: 'direction', header: 'In / Out', width: pixel(90) },
  { key: 'amount', header: 'Amount', width: pixel(130) },
];

export function LedgerTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        No transactions yet.
      </Text>
    );
  }
  return <Table data={rows} columns={columns} idKey="id" density="compact" hasHover />;
}
