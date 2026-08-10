import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { gitHubToken, verifyAuth } from "./model/utils";

export const listAllRepos = action({
  args: {},
  handler: async (ctx) => {
    const identity = await verifyAuth(ctx);
    const githubToken = await gitHubToken(identity.subject);

    const res = await fetch("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    return res.json();
  },
});

export const connectRepo = action({
  args: {
    username: v.string(),
    repo: v.string(),
    repoId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const githubToken = await gitHubToken(identity.subject);

    const currentUser = await ctx.runQuery(internal.users.getByClerkId, {
      clerkId: identity.subject,
    });

    const webhookUrl = `${process.env.APP_URL}/api/webhooks/github`;

    const res = await fetch(
      `https://api.github.com/repos/${args.username}/${args.repo}/hooks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: ["pull_request"],
          config: {
            url: webhookUrl,
            content_type: "json",
            secret: process.env.GITHUB_WEBHOOK_SECRET,
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create webhook: ${err}`);
    }

    const webhook = await res.json();

    await ctx.runMutation(internal.repos.saveConnectedRepo, {
      userId: currentUser._id,
      repoId: args.repoId,
      fullName: `${args.username}/${args.repo}`,
      webhookId: webhook.id,
    });

    return { success: true, webhookId: webhook.id };
  },
});

export const saveConnectedRepo = internalMutation({
  args: {
    userId: v.id("users"),
    repoId: v.number(),
    fullName: v.string(),
    webhookId: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("repos", {
      ...args,
    });
  },
});
