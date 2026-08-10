"use client";

import { Button } from "@/src/components/ui/button";
import { ButtonGroup } from "@/src/components/ui/button-group";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useConnectRepo } from "../hooks/use-connect-repo";
import { useDisconnectRepo } from "../hooks/use-disconnect-repo";
import { IconButton } from "@/src/components/custom/icon";
import { LockIcon } from "@hugeicons/core-free-icons";

export function RepoCardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-100 rounded-4xl overflow-hidden scroll-auto">
      <ButtonGroup orientation={"vertical"} className="w-full">
        {children}
      </ButtonGroup>
    </div>
  );
}

export function RepoCard({
  data,
  type,
}: {
  data: any;
  type: "all" | "connected";
}) {
  const { id, name, owner, visibility, isConnected, connectionId } = data;

  const connectRepo = useConnectRepo();
  const disconnectRepo = useDisconnectRepo();

  async function handleConnectRepo() {
    await connectRepo({ id, name, owner });
  }

  async function handleDisconnectRepo() {
    if (isConnected && connectionId) {
      await disconnectRepo({ connectionId });
    }
  }

  const handleClick = type === "all" ? handleConnectRepo : handleDisconnectRepo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {name}
          {visibility === "private" && (
            <IconButton
              icon={LockIcon}
              variant={"ghost"}
              className="text-muted-foreground cursor-auto"
            />
          )}
        </CardTitle>
        <CardAction>
          <Button
            variant={type === "all" ? "default" : "destructive"}
            onClick={handleClick}
          >
            {type === "all" ? "connect" : "disconnect"}
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
