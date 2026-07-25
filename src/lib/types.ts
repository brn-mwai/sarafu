export type TxnDirection = 'in' | 'out';

export type TxnCategory =
  | 'sale'
  | 'cash_sale'
  | 'stock_purchase'
  | 'supplier'
  | 'transport'
  | 'rent'
  | 'utilities'
  | 'wages'
  | 'fees'
  | 'personal'
  | 'transfer'
  | 'other';

export type TxnSource = 'mpesa' | 'cash';

export interface Txn {
  id: string;
  date: string;
  counterparty: string;
  reference: string;
  direction: TxnDirection;
  amount: number;
  category: TxnCategory;
  source: TxnSource;
  isRevenue: boolean;
  note?: string;
}

export const CATEGORY_LABEL: Record<TxnCategory, string> = {
  sale: 'Sale (M-Pesa)',
  cash_sale: 'Sale (cash)',
  stock_purchase: 'Stock purchase',
  supplier: 'Supplier payment',
  transport: 'Transport',
  rent: 'Rent',
  utilities: 'Utilities',
  wages: 'Wages',
  fees: 'Bank / M-Pesa fees',
  personal: 'Personal / drawings',
  transfer: 'Internal transfer',
  other: 'Uncategorised',
};
