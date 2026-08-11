import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserByClerkId, gitHubToken, verifyAuth } from "./model/utils";

export const listAllRepos = action({
  args: {},
  handler: async (ctx) => {
    const identity = await verifyAuth(ctx);
    const githubToken = await gitHubToken(identity.subject);

    let page = 1;
    let allRepos: any[] = [];

    while (true) {
      const res = await fetch(
        `https://api.github.com/user/repos?visibility=all&sort=updated&per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      const data = await res.json();
      if (data.length === 0) break;

      allRepos = allRepos.concat(data);
      page++;
    }

    return allRepos;
  },
});

export const listConnectedRepos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) return [];

    return await ctx.db
      .query("repos")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const connectRepo = action({
  args: {
    id: v.number(),
    name: v.string(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const githubToken = await gitHubToken(identity.subject);

    const currentUser = await ctx.runQuery(internal.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!currentUser) throw new Error("User doesn't exist");

    const webhookUrl = `${process.env.APP_URL}/github-webhook`;

    const res = await fetch(
      `https://api.github.com/repos/${args.owner}/${args.name}/hooks`,
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
      repoId: args.id,
      fullName: `${args.owner}/${args.name}`,
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

export const getConnectedRepo = internalQuery({
  args: { connectionId: v.id("repos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.connectionId);
  },
});

export const disconnectRepo = action({
  args: {
    connectionId: v.id("repos"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const githubToken = await gitHubToken(identity.subject);

    const connection = await ctx.runQuery(internal.repos.getConnectedRepo, {
      connectionId: args.connectionId,
    });

    if (!connection) {
      throw new Error("Connection not found");
    }

    const currentUser = await ctx.runQuery(internal.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!currentUser || connection.userId !== currentUser._id) {
      throw new Error("Not authorized to disconnect this repo");
    }

    const [owner, repo] = connection.fullName.split("/");

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/hooks/${connection.webhookId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    // 404 means GitHub already doesn't have it — treat as success, not an error
    if (!res.ok && res.status !== 404) {
      const err = await res.text();
      throw new Error(`Failed to delete webhook: ${err}`);
    }

    await ctx.runMutation(internal.repos.deleteConnectedRepo, {
      connectionId: args.connectionId,
    });

    return { success: true };
  },
});

export const deleteConnectedRepo = internalMutation({
  args: { connectionId: v.id("repos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.connectionId);
  },
});
