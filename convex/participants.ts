import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const addBulk = mutation({
  args: {
    surveyId: v.id("surveys"),
    participants: v.array(
      v.object({
        email: v.string(),
        name: v.string(),
        role: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids: Id<"participants">[] = [];
    for (const p of args.participants) {
      const existing = await ctx.db
        .query("participants")
        .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
        .filter((q) => q.eq(q.field("email"), p.email))
        .first();
      if (existing) {
        ids.push(existing._id);
        continue;
      }
      const id = await ctx.db.insert("participants", {
        surveyId: args.surveyId,
        email: p.email,
        name: p.name,
        role: p.role,
        token: generateToken(),
        status: "invited",
        invitedAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

export const remove = mutation({
  args: { id: v.id("participants") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listBySurvey = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("participants")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("participants")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const markStarted = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!participant) throw new Error("Participant not found");
    if (participant.status === "invited") {
      await ctx.db.patch(participant._id, {
        status: "started",
        startedAt: Date.now(),
      });
    }
    return participant;
  },
});

export const markCompleted = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const markReminderSent = mutation({
  args: { id: v.id("participants") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { reminderSentAt: Date.now() });
  },
});
