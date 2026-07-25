import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  businesses: defineTable({
    chatId: v.string(),
    name: v.optional(v.string()),
  }).index('by_chat', ['chatId']),

  transactions: defineTable({
    businessId: v.id('businesses'),
    date: v.string(),
    counterparty: v.string(),
    reference: v.optional(v.string()),
    direction: v.union(v.literal('in'), v.literal('out')),
    amount: v.number(),
    category: v.string(),
    source: v.union(v.literal('mpesa'), v.literal('cash')),
    isRevenue: v.boolean(),
  })
    .index('by_business', ['businessId'])
    .index('by_business_date', ['businessId', 'date']),

  cashDays: defineTable({
    businessId: v.id('businesses'),
    date: v.string(),
    amount: v.number(),
  }).index('by_business_date', ['businessId', 'date']),

  messages: defineTable({
    businessId: v.id('businesses'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  }).index('by_business', ['businessId']),
});
