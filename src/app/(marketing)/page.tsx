"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-semibold text-xl">tortoise</h1>
          <p className="font-mono text-muted-foreground">
            ai-first pull request reviewer
          </p>
        </div>

        <Link href={`/auth`}>
          <Button>get started</Button>
        </Link>
      </div>
    </div>
  );
}
