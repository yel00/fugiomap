import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const saveResponse = mutation({
  args: {
    surveyId: v.id("surveys"),
    participantId: v.id("participants"),
    questionId: v.id("questions"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("responses")
      .withIndex("by_participant_question", (q) =>
        q
          .eq("participantId", args.participantId)
          .eq("questionId", args.questionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { score: args.score });
    } else {
      await ctx.db.insert("responses", args);
    }
  },
});

export const saveBulk = mutation({
  args: {
    surveyId: v.id("surveys"),
    participantId: v.id("participants"),
    answers: v.array(
      v.object({
        questionId: v.id("questions"),
        score: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const answer of args.answers) {
      const existing = await ctx.db
        .query("responses")
        .withIndex("by_participant_question", (q) =>
          q
            .eq("participantId", args.participantId)
            .eq("questionId", answer.questionId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { score: answer.score });
      } else {
        await ctx.db.insert("responses", {
          surveyId: args.surveyId,
          participantId: args.participantId,
          questionId: answer.questionId,
          score: answer.score,
        });
      }
    }
  },
});

export const getByParticipant = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_participant", (q) =>
        q.eq("participantId", args.participantId)
      )
      .collect();
  },
});

export const getBySurvey = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();
  },
});
