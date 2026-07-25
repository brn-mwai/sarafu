import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';

async function resolveBusiness(ctx: any, chatId: string): Promise<Id<'businesses'>> {
  const existing = await ctx.db
    .query('businesses')
    .withIndex('by_chat', (q: any) => q.eq('chatId', chatId))
    .unique();
  if (existing) return existing._id;
  return await ctx.db.insert('businesses', { chatId });
}

export const addTransactions = mutation({
  args: {
    chatId: v.string(),
    transactions: v.array(
      v.object({
        date: v.string(),
        counterparty: v.string(),
        reference: v.optional(v.string()),
        direction: v.union(v.literal('in'), v.literal('out')),
        amount: v.number(),
        category: v.string(),
        isRevenue: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const businessId = await resolveBusiness(ctx, args.chatId);
    for (const t of args.transactions) {
      await ctx.db.insert('transactions', { ...t, businessId, source: 'mpesa' as const });
    }
    return { inserted: args.transactions.length };
  },
});

export const logCash = mutation({
  args: { chatId: v.string(), date: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const businessId = await resolveBusiness(ctx, args.chatId);
    const existing = await ctx.db
      .query('cashDays')
      .withIndex('by_business_date', (q) =>
        q.eq('businessId', businessId).eq('date', args.date),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount });
      return { replaced: true, previous: existing.amount };
    }
    await ctx.db.insert('cashDays', { businessId, date: args.date, amount: args.amount });
    return { replaced: false };
  },
});

export const getLedger = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .unique();

    if (!business) return { transactions: [], cashDays: [] };

    const [transactions, cashDays] = await Promise.all([
      ctx.db
        .query('transactions')
        .withIndex('by_business', (q) => q.eq('businessId', business._id))
        .collect(),
      ctx.db
        .query('cashDays')
        .withIndex('by_business_date', (q) => q.eq('businessId', business._id))
        .collect(),
    ]);

    return { transactions, cashDays };
  },
});

export const getLatestLedger = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query('businesses').collect();
    const business = businesses[businesses.length - 1];
    if (!business) return { transactions: [], cashDays: [], chatId: null };

    const [transactions, cashDays] = await Promise.all([
      ctx.db
        .query('transactions')
        .withIndex('by_business', (q) => q.eq('businessId', business._id))
        .collect(),
      ctx.db
        .query('cashDays')
        .withIndex('by_business_date', (q) => q.eq('businessId', business._id))
        .collect(),
    ]);

    return { transactions, cashDays, chatId: business.chatId };
  },
});

export const getHistory = query({
  args: { chatId: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .unique();
    if (!business) return [];

    const all = await ctx.db
      .query('messages')
      .withIndex('by_business', (q) => q.eq('businessId', business._id))
      .collect();

    return all.slice(-args.limit).map((m: Doc<'messages'>) => ({
      role: m.role,
      content: m.content,
    }));
  },
});

export const appendMessage = mutation({
  args: {
    chatId: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const businessId = await resolveBusiness(ctx, args.chatId);
    await ctx.db.insert('messages', {
      businessId,
      role: args.role,
      content: args.content,
    });
  },
});
