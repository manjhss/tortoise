import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";

async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  async handler(ctx, { data }) {
    const clerkId = data.id;
    const email = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;

    const user = await getUserByClerkId(ctx, clerkId);

    if (!user) {
      await ctx.db.insert("users", {
        clerkId,
        email,
        firstName,
        lastName,
      });
    } else {
      console.warn(`Can't create user for clerk ID: ${clerkId}`);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const user = await getUserByClerkId(ctx, clerkId);

    if (user) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Can't delete user for clerk ID: ${clerkId}`);
    }
  },
});
