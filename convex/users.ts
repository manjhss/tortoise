import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getUserByClerkId } from "./model/utils";

export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => getUserByClerkId(ctx, args.clerkId),
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  async handler(ctx, { data }) {
    const clerkId = data.id;
    const email = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const username = data.username;

    const user = await getUserByClerkId(ctx, clerkId);

    if (!user) {
      await ctx.db.insert("users", {
        clerkId,
        username,
        email,
        firstName,
        lastName,
      });
    } else {
      await ctx.db.patch(user._id, {
        username,
        email,
        firstName,
        lastName,
      });
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
