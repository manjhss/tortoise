import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payloadString = await request.text();

      const svixHeaders = {
        "svix-id": request.headers.get("svix-id") || "",
        "svix-timestamp": request.headers.get("svix-timestamp") || "",
        "svix-signature": request.headers.get("svix-signature") || "",
      };

      if (!process.env.CLERK_WEBHOOK_SECRET) {
        console.error("Webhook configuration error");
        return new Response("Server configuration error", { status: 500 });
      }

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      const event = wh.verify(payloadString, svixHeaders) as { type: string; data: Record<string, unknown> };

      switch (event.type) {
        case "user.created":
        case "user.updated":
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
          break;
        case "user.deleted":
          await ctx.runMutation(internal.users.deleteFromClerk, { clerkId: event.data.id as string });
          break;
        default:
          console.log("Ignored webhook event:", event.type);
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook processing failed:", error instanceof Error ? error.message : "Unknown error");
      return new Response("Webhook processing failed", { status: 400 });
    }
  }),
});

export default http;