import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

async function resolveBusiness(ctx: any, chatId: string): Promise<Id<'businesses'>> {
  const existing = await ctx.db
    .query('businesses')
    .withIndex('by_chat', (q: any) => q.eq('chatId', chatId))
    .unique();
  if (existing) return existing._id;
  return await ctx.db.insert('businesses', { chatId });
}

export const saveDocument = mutation({
  args: {
    chatId: v.string(),
    kind: v.string(),
    telegramFileId: v.string(),
    summary: v.string(),
    docDate: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const businessId = await resolveBusiness(ctx, args.chatId);
    const { chatId, ...rest } = args;
    const id = await ctx.db.insert('documents', { ...rest, businessId });
    return { documentId: id };
  },
});

export const recordAssessment = mutation({
  args: {
    chatId: v.string(),
    reference: v.optional(v.string()),
    taxType: v.string(),
    assessedAmount: v.number(),
    periodFrom: v.string(),
    periodTo: v.string(),
    servedDate: v.string(),
    objectionDeadline: v.string(),
  },
  handler: async (ctx, args) => {
    const businessId = await resolveBusiness(ctx, args.chatId);
    const { chatId, ...rest } = args;
    const id = await ctx.db.insert('kraAssessments', {
      ...rest,
      businessId,
      status: 'open',
    });
    return { assessmentId: id };
  },
});

export const listAssessments = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .unique();
    if (!business) return [];
    return await ctx.db
      .query('kraAssessments')
      .withIndex('by_business', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const listDocuments = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .unique();
    if (!business) return [];
    return await ctx.db
      .query('documents')
      .withIndex('by_business', (q) => q.eq('businessId', business._id))
      .collect();
  },
});
