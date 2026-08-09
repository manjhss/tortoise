"use client";

import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

import { Button, buttonVariants } from "@/src/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface IconProps {
  icon: IconSvgElement;
}

export function Icon({ icon }: IconProps) {
  return <HugeiconsIcon icon={icon} strokeWidth={2} />;
}

interface IconButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  icon: IconSvgElement;
}

export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <Button size={"icon"} {...props}>
      <HugeiconsIcon icon={icon} strokeWidth={2} />
    </Button>
  );
}
