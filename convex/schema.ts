import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  questions: defineTable({
    text: v.string(),
    category: v.string(),
    polarity: v.union(v.literal("positive"), v.literal("negative")),
    order: v.number(),
    isActive: v.boolean(),
    useCases: v.array(v.string()),
  }).index("by_category", ["category"]).index("by_order", ["order"]),

  surveys: defineTable({
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    name: v.string(),
    companyName: v.string(),
    industry: v.string(),
    location: v.string(),
    logoUrl: v.optional(v.string()),
    status: v.union(
      v.literal("setup"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    customEmailMessage: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    pricePlan: v.optional(v.string()),
    eulaAcceptedAt: v.optional(v.number()),
    reportGeneratedAt: v.optional(v.number()),
    questionVersion: v.number(),
  })
    .index("by_org", ["clerkOrgId"])
    .index("by_user", ["clerkUserId"])
    .index("by_status", ["status"]),

  participants: defineTable({
    surveyId: v.id("surveys"),
    email: v.string(),
    name: v.string(),
    role: v.string(),
    token: v.string(),
    status: v.union(
      v.literal("invited"),
      v.literal("started"),
      v.literal("completed")
    ),
    invitedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    reminderSentAt: v.optional(v.number()),
  })
    .index("by_survey", ["surveyId"])
    .index("by_token", ["token"])
    .index("by_survey_status", ["surveyId", "status"]),

  responses: defineTable({
    surveyId: v.id("surveys"),
    participantId: v.id("participants"),
    questionId: v.id("questions"),
    score: v.number(),
  })
    .index("by_survey", ["surveyId"])
    .index("by_participant", ["participantId"])
    .index("by_participant_question", ["participantId", "questionId"]),

  reports: defineTable({
    surveyId: v.id("surveys"),
    generatedAt: v.number(),
    categoryScores: v.array(
      v.object({
        category: v.string(),
        avgScore: v.number(),
        questionCount: v.number(),
        riskLevel: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high")
        ),
      })
    ),
    questionScores: v.array(
      v.object({
        questionId: v.string(),
        text: v.string(),
        category: v.string(),
        polarity: v.string(),
        avgScore: v.number(),
        responseCount: v.number(),
      })
    ),
    participantCount: v.number(),
    completionRate: v.number(),
    overallScore: v.number(),
  }).index("by_survey", ["surveyId"]),

  // Fugio internal: audit log
  auditLog: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    userId: v.string(),
    metadata: v.optional(v.string()),
  }).index("by_entity", ["entityType", "entityId"]),
});
