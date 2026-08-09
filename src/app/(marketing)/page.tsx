"use client";

import { Button } from "@/src/components/ui/button";
import { ModeToggle } from "@/src/components/custom/mode-toggle";

export default function Home() {
  return (
    <div>
      <ModeToggle />
      <Button>hi</Button>
    </div>
  );
}
