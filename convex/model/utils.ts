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

  return user;
}

export async function gitHubToken(clerkId: string) {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const tokens = await clerk.users.getUserOauthAccessToken(clerkId, "github");

  const githubToken = tokens.data[0]?.token;
  if (!githubToken) throw new Error("No GitHub token found for this user");

  return githubToken;
}

export async function verifySignature(
  payload: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const hex = signature.replace("sha256=", "");
  const signatureBytes = hexToBytes(hex);

  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(payload),
  );
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
