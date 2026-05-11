import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Score interpretation:
// Positive question: score 4-5 = healthy, 2-3 = caution, 1 = risk
// Negative question: score 1-2 = healthy (disagreeing with problem), 3-5 = risk
// We normalize so higher normalized score = healthier

function normalizeScore(raw: number, polarity: string): number {
  if (polarity === "negative") {
    return 6 - raw; // invert: 5→1, 1→5
  }
  return raw;
}

function riskLevel(avgNormalized: number): "low" | "medium" | "high" {
  if (avgNormalized >= 3.5) return "low";
  if (avgNormalized >= 2.5) return "medium";
  return "high";
}

export const generateReport = mutation({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) throw new Error("Survey not found");

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    const responses = await ctx.db
      .query("responses")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    const questions = await ctx.db.query("questions").collect();
    const questionMap = new Map(questions.map((q) => [q._id as string, q]));

    // Group responses by question
    const byQuestion = new Map<string, number[]>();
    for (const r of responses) {
      const qid = r.questionId as string;
      if (!byQuestion.has(qid)) byQuestion.set(qid, []);
      byQuestion.get(qid)!.push(r.score);
    }

    // Compute per-question scores
    const questionScores: Array<{
      questionId: string;
      text: string;
      category: string;
      polarity: string;
      avgScore: number;
      responseCount: number;
    }> = [];

    for (const [qid, scores] of byQuestion.entries()) {
      const q = questionMap.get(qid);
      if (!q) continue;
      const rawAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const normalized = normalizeScore(rawAvg, q.polarity);
      questionScores.push({
        questionId: qid,
        text: q.text,
        category: q.category,
        polarity: q.polarity,
        avgScore: Math.round(normalized * 100) / 100,
        responseCount: scores.length,
      });
    }

    // Aggregate by category
    const categoryMap = new Map<string, number[]>();
    for (const qs of questionScores) {
      if (!categoryMap.has(qs.category)) categoryMap.set(qs.category, []);
      categoryMap.get(qs.category)!.push(qs.avgScore);
    }

    const categoryScores = Array.from(categoryMap.entries()).map(
      ([category, scores]) => {
        const avgScore =
          scores.reduce((a, b) => a + b, 0) / scores.length;
        return {
          category,
          avgScore: Math.round(avgScore * 100) / 100,
          questionCount: scores.length,
          riskLevel: riskLevel(avgScore),
        };
      }
    );

    // Overall score
    const allNormalized = questionScores.map((q) => q.avgScore);
    const overallScore =
      allNormalized.length > 0
        ? allNormalized.reduce((a, b) => a + b, 0) / allNormalized.length
        : 0;

    const completed = participants.filter((p) => p.status === "completed").length;
    const completionRate =
      participants.length > 0 ? completed / participants.length : 0;

    // Upsert report
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .first();

    const reportData = {
      surveyId: args.surveyId,
      generatedAt: Date.now(),
      categoryScores,
      questionScores,
      participantCount: participants.length,
      completionRate: Math.round(completionRate * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
    };

    let reportId: Id<"reports">;
    if (existing) {
      await ctx.db.patch(existing._id, reportData);
      reportId = existing._id;
    } else {
      reportId = await ctx.db.insert("reports", reportData);
    }

    await ctx.db.patch(args.surveyId, { reportGeneratedAt: Date.now() });

    return reportId;
  },
});

export const getReport = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .first();
  },
});

export const getSurveyProgress = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    const total = participants.length;
    const completed = participants.filter((p) => p.status === "completed").length;
    const started = participants.filter((p) => p.status === "started").length;
    const invited = participants.filter((p) => p.status === "invited").length;

    return {
      total,
      completed,
      started,
      invited,
      completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
});
