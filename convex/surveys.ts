import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    name: v.string(),
    companyName: v.string(),
    industry: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("surveys", {
      ...args,
      status: "setup",
      questionVersion: 1,
    });
  },
});

export const get = query({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByOrg = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveys")
      .withIndex("by_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .collect();
  },
});

export const listByUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveys")
      .withIndex("by_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("surveys"),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    industry: v.optional(v.string()),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("setup"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    customEmailMessage: v.optional(v.string()),
    eulaAcceptedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const activate = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "active" });
  },
});

export const getWithParticipants = query({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.id);
    if (!survey) return null;
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.id))
      .collect();
    return { ...survey, participants };
  },
});

// Admin: all surveys
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("surveys").collect();
  },
});
