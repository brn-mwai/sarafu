import type { TxnCategory } from './types';

export const CATEGORY_VALUES: TxnCategory[] = [
  'sale',
  'cash_sale',
  'stock_purchase',
  'supplier',
  'transport',
  'rent',
  'utilities',
  'wages',
  'fees',
  'transfer',
  'other',
];

export const SARAFU_SYSTEM_PROMPT = `You are Sarafu, a bookkeeper for small Kenyan businesses. You talk to shop owners on Telegram.

Who you are talking to: an owner-operator running a duka, salon, hardware stall, kiosk or small distribution business. She banks on M-Pesa, takes cash, has no accountant, and has never kept books. She is on a phone, often mid-trade, often on a slow connection.

How to talk:
- Short. Two or three sentences unless she asks for detail. She is reading this between customers.
- Plain English, or Swahili if she writes in Swahili. Never accounting jargon. Say "money in" not "revenue recognition", "stock" not "cost of goods sold".
- Money always as KES with thousands separators.
- No emoji. No greetings after the first message. No "I hope this helps".
- Never lecture her about compliance or bookkeeping discipline.

What you do:
- When she pastes an M-Pesa statement, call parse_statement. Never try to read it yourself and never summarise it without parsing.
- When she tells you a cash figure for a day ("cash today 3400", "leo 2800", "made 5k cash"), call log_cash. Take the number and move on. Do not ask what it was for.
- When she asks how the business is doing, call get_summary.
- When she asks about tax, KRA, or what she owes, call get_tax_position.

Rules you never break:
- Never invent a number. If you do not have the data, say what is missing and how to give it to you.
- If cash days are missing, say the figure is incomplete and name how many days are missing. An incomplete number stated plainly beats a confident wrong one.
- Never present a tax figure as final. It is her working number, and it depends on the cash she has entered.
- If she asks something outside her business finances, answer briefly and steer back.

First contact: tell her in two sentences what to do. Paste an M-Pesa statement, or send today's cash number.`;

export const TOOLS = [
  {
    name: 'parse_statement',
    description:
      'Parse raw M-Pesa statement text into structured business transactions. Call this whenever the user pastes statement text, a block of transaction lines, or anything that looks like an M-Pesa export. Extract every transaction you can see. Classify each line by what it means for the business.',
    input_schema: {
      type: 'object' as const,
      properties: {
        transactions: {
          type: 'array',
          description: 'Every transaction found in the statement text.',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'ISO date, YYYY-MM-DD.' },
              counterparty: {
                type: 'string',
                description:
                  'Who the money moved to or from, as written in the statement. Strip the phone number.',
              },
              reference: { type: 'string', description: 'M-Pesa receipt code if present.' },
              direction: {
                type: 'string',
                enum: ['in', 'out'],
                description: 'in for money received, out for money paid.',
              },
              amount: { type: 'number', description: 'Positive number, KES.' },
              category: {
                type: 'string',
                enum: CATEGORY_VALUES,
                description:
                  'sale for customer payments in. stock_purchase for buying goods to resell. supplier for known suppliers. transport for fare, fuel, boda, delivery. rent for premises. utilities for power, water, airtime for business. wages for staff. fees for M-Pesa and bank charges. transfer for moving float between own accounts. other when genuinely unclear.',
              },
              isRevenue: {
                type: 'boolean',
                description:
                  'True only if this is money earned from selling something. A transfer in is not revenue.',
              },
            },
            required: ['date', 'counterparty', 'direction', 'amount', 'category', 'isRevenue'],
          },
        },
        periodStart: { type: 'string', description: 'ISO date of earliest transaction.' },
        periodEnd: { type: 'string', description: 'ISO date of latest transaction.' },
      },
      required: ['transactions', 'periodStart', 'periodEnd'],
    },
  },
  {
    name: 'log_cash',
    description:
      'Record cash sales for one day. Call this when the user gives a cash figure. Never ask what the cash was for; one number is the entire interaction.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: {
          type: 'string',
          description: 'ISO date YYYY-MM-DD. Use today unless she names another day.',
        },
        amount: { type: 'number', description: 'Cash sales in KES for that day.' },
      },
      required: ['date', 'amount'],
    },
  },
  {
    name: 'get_summary',
    description:
      'Read the business position: money in, money out, margin, top customers, biggest costs, and how many cash days are missing. Call this before answering any question about how the business is doing.',
    input_schema: {
      type: 'object' as const,
      properties: {
        days: {
          type: 'number',
          description: 'How many days back to summarise. Use 30 unless she asks for another period.',
        },
      },
      required: ['days'],
    },
  },
  {
    name: 'generate_report',
    description:
      'Pull everything needed for a full business report: sales split by channel, costs by category, margin, top customers, best and worst trading days, month-on-month movement, and the tax position. Call this when she asks for a report, a summary for the bank, a statement for a lender, or "how did the month go". After calling it, write the report yourself in plain language she can forward to a lender or a chama.',
    input_schema: {
      type: 'object' as const,
      properties: {
        months: {
          type: 'number',
          description: 'How many months to cover. Use 1 unless she asks for longer.',
        },
      },
      required: ['months'],
    },
  },
  {
    name: 'get_tax_position',
    description:
      'Compute the turnover tax position from the ledger: annualised turnover, whether she is inside the KES 1,000,000 to 25,000,000 band, what is owed at 1.5%, days until the 20th, and how close she is to the KES 5,000,000 VAT and eTIMS line.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];
