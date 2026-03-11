import { useMemo } from "react";
import { AppThemes } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useAppTheme() {
  const scheme = useColorScheme() === "light" ? "light" : "dark";
  return useMemo(() => AppThemes[scheme], [scheme]);
}
