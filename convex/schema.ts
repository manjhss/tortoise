import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  }).index("byClerkId", ["clerkId"]),

  repos: defineTable({
    userId: v.id("users"),
    repoId: v.number(), 
    fullName: v.string(),
    webhookId: v.number(),
  }).index("byUserId", ["userId"])
      .index("byRepoId", ["repoId"]),
});
