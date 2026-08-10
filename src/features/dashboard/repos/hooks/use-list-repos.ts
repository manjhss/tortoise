"use client";

import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";

export function useListAllRepos() {
  return useAction(api.repos.listAllRepos);
}

export function useListConnectedRepos() {
  return useQuery(api.repos.listConnectedRepos) ?? [];
}
