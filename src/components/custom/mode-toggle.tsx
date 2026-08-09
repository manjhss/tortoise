"use client";

import { DarkModeIcon } from "@hugeicons/core-free-icons";
import { IconButton } from "@/src/components/custom/icon";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const currentIcon = theme === "light" ? DarkModeIcon : DarkModeIcon;

  return (
    <IconButton
      icon={currentIcon}
      variant={"secondary"}
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    />
  );
}
