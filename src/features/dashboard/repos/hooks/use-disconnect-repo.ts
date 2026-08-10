"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDisconnectRepo() {
  return useAction(api.repos.disconnectRepo);
}
