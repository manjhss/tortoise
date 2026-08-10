import { MutationCtx, QueryCtx, ActionCtx } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

export async function verifyAuth(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized user");

  return identity;
}

export async function getUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkId: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user) throw new Error("User doesn't exist");
  return user;
}

export async function gitHubToken(clerkId: string) {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const tokens = await clerk.users.getUserOauthAccessToken(clerkId, "github");

  const githubToken = tokens.data[0]?.token;
  if (!githubToken) throw new Error("No GitHub token found for this user");

  return githubToken;
}
