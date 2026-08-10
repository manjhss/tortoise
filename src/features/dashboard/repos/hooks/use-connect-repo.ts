"use client";

import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";

export function useConnectRepo() {
  return useAction(api.repos.connectRepo);
}
