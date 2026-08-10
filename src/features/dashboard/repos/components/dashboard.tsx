"use client";

import { useEffect, useState } from "react";
import {
  useListAllRepos,
  useListConnectedRepos,
} from "../hooks/use-list-repos";
import { RepoCard, RepoCardGroup } from "./repo-card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";

export function Dashboard() {
  const listAllRepos = useListAllRepos();
  const connectedRepos = useListConnectedRepos();

  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    const handleFetch = async () => {
      const result = await listAllRepos();
      setRepos(result);
    };

    handleFetch();
  }, []);

  const connectionsByRepoId = new Map(connectedRepos.map((c) => [c.repoId, c]));

  const mergedRepos = repos.map((repo) => {
    const connection = connectionsByRepoId.get(repo.id);
    return {
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      visibility: repo.visibility,
      isConnected: !!connection,
      connectionId: connection?._id,
    };
  });

  const connected = mergedRepos.filter((r) => r.isConnected);
  const all = mergedRepos.filter((r) => !r.isConnected);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-semibold text-xl">repositories</h1>
          <p className="font-mono text-muted-foreground">
            find, connect and start reviewing
          </p>
        </div>

        <div>
          <Tabs defaultValue="all" className="w-100">
            <TabsList>
              <TabsTrigger value="all">all</TabsTrigger>
              <TabsTrigger value="connected">connected</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <RepoCardGroup>
                {all.map((repo, index) => (
                  <RepoCard key={index} type="all" data={repo} />
                ))}
              </RepoCardGroup>
            </TabsContent>

            <TabsContent value="connected">
              <RepoCardGroup>
                {connected.map((repo, index) => (
                  <RepoCard key={index} type="connected" data={repo} />
                ))}
              </RepoCardGroup>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
