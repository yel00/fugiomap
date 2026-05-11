import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_order")
      .collect();
    if (args.activeOnly) {
      return questions.filter((q) => q.isActive);
    }
    return questions;
  },
});

export const get = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("questions")),
    text: v.string(),
    category: v.string(),
    polarity: v.union(v.literal("positive"), v.literal("negative")),
    order: v.number(),
    isActive: v.boolean(),
    useCases: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("questions", data);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    const q = await ctx.db.get(args.id);
    if (!q) throw new Error("Question not found");
    await ctx.db.patch(args.id, { isActive: !q.isActive });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("questions").first();
    if (existing) return { seeded: false, message: "Questions already seeded" };

    const questions = [
      // Business Leadership
      { text: "Our collaboration is initiated and supported at all levels; it's not a mandate from leadership.", category: "Business Leadership", polarity: "positive" as const, order: 1 },
      { text: "Our goals are aggressive and fair, and they can be achieved without miracles or heroics.", category: "Business Leadership", polarity: "positive" as const, order: 2 },
      { text: "Our strategy to achieve our objectives is regularly communicated and updated, easy to understand and believable.", category: "Business Leadership", polarity: "positive" as const, order: 3 },
      { text: "Our teams are given the trust, responsibilities and tools that give them self-confidence to complete their objectives.", category: "Business Leadership", polarity: "positive" as const, order: 4 },
      { text: "Our teams have diverse educational and professional backgrounds and experiences.", category: "Business Leadership", polarity: "positive" as const, order: 5 },
      { text: "We admit our mistakes, and we work to learn from them.", category: "Business Leadership", polarity: "positive" as const, order: 6 },
      { text: "We only put processes in place to make things better (e.g., faster or easier) for customers or our teams.", category: "Business Leadership", polarity: "positive" as const, order: 7 },
      { text: "There isn't time for training, so we require people to know their job from the outset.", category: "Business Leadership", polarity: "negative" as const, order: 8 },
      { text: "Communication breakdowns usually require the involvement of more senior people to resolve.", category: "Business Leadership", polarity: "negative" as const, order: 9 },
      { text: "We focus people on their immediate objectives; we don't worry about the long-term.", category: "Business Leadership", polarity: "negative" as const, order: 10 },
      { text: "We tend to lose good people because demand for their skills is so high.", category: "Business Leadership", polarity: "negative" as const, order: 11 },
      { text: "When there is a problem, we assign it to the group responsible to fix it.", category: "Business Leadership", polarity: "negative" as const, order: 12 },

      // Product Management & Tech
      { text: "All of our product enhancements are tied to customer needs.", category: "Product Management & Tech", polarity: "positive" as const, order: 13 },
      { text: "Our metrics are able to detect customer problems early.", category: "Product Management & Tech", polarity: "positive" as const, order: 14 },
      { text: "Our product achieves strong adoption rates with customers.", category: "Product Management & Tech", polarity: "positive" as const, order: 15 },
      { text: "Our product is built to be widely adopted by customers with minimal customization.", category: "Product Management & Tech", polarity: "positive" as const, order: 16 },
      { text: "Our product roadmap lays out a clear vision that we update and refer to regularly to ensure we're investing in the right way.", category: "Product Management & Tech", polarity: "positive" as const, order: 17 },
      { text: "We continually allocate resources to improve our code base (refactoring, QA, etc.).", category: "Product Management & Tech", polarity: "positive" as const, order: 18 },
      { text: "We've designed our product to make it easy for customers to incorporate into their existing workflows.", category: "Product Management & Tech", polarity: "positive" as const, order: 19 },

      // Clients
      { text: "Our pricing strategy is consistent and easy to explain and understand by prospective customers.", category: "Clients", polarity: "positive" as const, order: 20 },
      { text: "Our product achieves the core objectives of our target customers.", category: "Clients", polarity: "positive" as const, order: 21 },
      { text: "Our product is reasonably intuitive and has a shallow learning curve for customers.", category: "Clients", polarity: "positive" as const, order: 22 },
      { text: "Our product's features are specifically targeted to help our customers efficiently achieve specific goals and objectives.", category: "Clients", polarity: "positive" as const, order: 23 },

      // Competition & Markets
      { text: "Our ideal customer profile is readily measurable and findable in the market.", category: "Competition & Markets", polarity: "positive" as const, order: 24 },
      { text: "Our product differentiation is clear and meaningful to customers.", category: "Competition & Markets", polarity: "positive" as const, order: 25 },
      { text: "We monitor the market for opportunities and prioritize what market changes to respond to.", category: "Competition & Markets", polarity: "positive" as const, order: 26 },
      { text: "We monitor trends that impact our customers' technology stacks and industries, as well as those used to build our product.", category: "Competition & Markets", polarity: "positive" as const, order: 27 },
      { text: "We assign everyone responsibility for monitoring our competition.", category: "Competition & Markets", polarity: "negative" as const, order: 28 },

      // Sales, Marketing & Customer Service
      { text: "Our company is attentive and responsive to public relations issues that impact our company and the perception of our products.", category: "Sales, Marketing & Customer Service", polarity: "positive" as const, order: 29 },
      { text: "Our product marketing plan is understood and widely shared across teams with updated positioning.", category: "Sales, Marketing & Customer Service", polarity: "positive" as const, order: 30 },
      { text: "Our product updates are more about adding new capabilities for customers than fixing bugs and addressing customer issues.", category: "Sales, Marketing & Customer Service", polarity: "positive" as const, order: 31 },
      { text: "Our sales channels are aligned to how customers want to buy.", category: "Sales, Marketing & Customer Service", polarity: "positive" as const, order: 32 },
    ];

    for (const q of questions) {
      await ctx.db.insert("questions", {
        ...q,
        isActive: true,
        useCases: ["all"],
      });
    }

    return { seeded: true, count: questions.length };
  },
});
