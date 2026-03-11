import { Platform } from "react-native";

type StatusTone = {
  card: string;
  border: string;
  subtle: string;
  text: string;
};

export type AppTheme = {
  colors: {
    accent: string;
    accentText: string;
    background: string;
    borderSoft: string;
    borderStrong: string;
    card: string;
    cardAlt: string;
    danger: string;
    dangerSoft: string;
    dangerText: string;
    input: string;
    inputBorder: string;
    muted: string;
    mutedStrong: string;
    overlay: string;
    primary: string;
    primaryPressed: string;
    primaryText: string;
    ring: string;
    secondary: string;
    shadow: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    textSoft: string;
    warningSoft: string;
    warningText: string;
  };
  radius: {
    lg: number;
    md: number;
    pill: number;
    sm: number;
    xl: number;
  };
  shadow: {
    card: {
      elevation: number;
      opacity: number;
      radius: number;
      y: number;
    };
    pop: {
      elevation: number;
      opacity: number;
      radius: number;
      y: number;
    };
  };
  sizes: {
    body: number;
    hero: number;
    label: number;
    title: number;
  };
  space: {
    lg: number;
    md: number;
    sm: number;
    xl: number;
    xs: number;
  };
  status: {
    fresh: StatusTone;
    future: StatusTone;
    neutral: StatusTone;
    stale: StatusTone;
    urgent: StatusTone;
  };
};

export const AppThemes: Record<"dark" | "light", AppTheme> = {
  dark: {
    colors: {
      accent: "#34d399",
      accentText: "#04261a",
      background: "#070d16",
      borderSoft: "#2a3d59",
      borderStrong: "#3b5880",
      card: "#0f172a",
      cardAlt: "#111f36",
      danger: "#f87171",
      dangerSoft: "#3f1319",
      dangerText: "#fecdd3",
      input: "#0a1220",
      inputBorder: "#4b6386",
      muted: "#1a2942",
      mutedStrong: "#253a5a",
      overlay: "rgba(2, 6, 23, 0.72)",
      primary: "#38bdf8",
      primaryPressed: "#0ea5e9",
      primaryText: "#e6f7ff",
      ring: "#7dd3fc",
      secondary: "#13233a",
      shadow: "#020817",
      surface: "#0c1628",
      surfaceAlt: "#15253d",
      text: "#eaf2ff",
      textMuted: "#9cb0ce",
      textSoft: "#c5d6ef",
      warningSoft: "#45260a",
      warningText: "#fde68a",
    },
    radius: {
      lg: 16,
      md: 12,
      pill: 999,
      sm: 10,
      xl: 22,
    },
    shadow: {
      card: {
        elevation: 4,
        opacity: 0.22,
        radius: 10,
        y: 4,
      },
      pop: {
        elevation: 8,
        opacity: 0.35,
        radius: 14,
        y: 8,
      },
    },
    sizes: {
      body: 16,
      hero: 31,
      label: 13,
      title: 21,
    },
    space: {
      lg: 18,
      md: 14,
      sm: 10,
      xl: 24,
      xs: 6,
    },
    status: {
      fresh: { card: "#09301f", border: "#1c6a43", text: "#86efac", subtle: "#4ade80" },
      future: { card: "#162b52", border: "#315fb0", text: "#bfdbfe", subtle: "#93c5fd" },
      neutral: { card: "#0f172a", border: "#334155", text: "#e2e8f0", subtle: "#94a3b8" },
      stale: { card: "#4a2b07", border: "#ad6a0f", text: "#fcd34d", subtle: "#fbbf24" },
      urgent: { card: "#4a1014", border: "#b91c1c", text: "#fecaca", subtle: "#fca5a5" },
    },
  },
  light: {
    colors: {
      accent: "#0d9488",
      accentText: "#ecfdfa",
      background: "#f2f6fb",
      borderSoft: "#d2deef",
      borderStrong: "#b5c7df",
      card: "#ffffff",
      cardAlt: "#f6faff",
      danger: "#dc2626",
      dangerSoft: "#fee2e2",
      dangerText: "#991b1b",
      input: "#ffffff",
      inputBorder: "#b6c8e2",
      muted: "#edf3fc",
      mutedStrong: "#dbe7f8",
      overlay: "rgba(15, 23, 42, 0.25)",
      primary: "#0a7ea4",
      primaryPressed: "#086b8b",
      primaryText: "#f8fcff",
      ring: "#38bdf8",
      secondary: "#dff2ff",
      shadow: "#0f172a",
      surface: "#f8fbff",
      surfaceAlt: "#eef4ff",
      text: "#0b1729",
      textMuted: "#60718f",
      textSoft: "#2b3e5a",
      warningSoft: "#fef3c7",
      warningText: "#92400e",
    },
    radius: {
      lg: 16,
      md: 12,
      pill: 999,
      sm: 10,
      xl: 22,
    },
    shadow: {
      card: {
        elevation: 3,
        opacity: 0.14,
        radius: 9,
        y: 3,
      },
      pop: {
        elevation: 7,
        opacity: 0.2,
        radius: 12,
        y: 7,
      },
    },
    sizes: {
      body: 16,
      hero: 31,
      label: 13,
      title: 21,
    },
    space: {
      lg: 18,
      md: 14,
      sm: 10,
      xl: 24,
      xs: 6,
    },
    status: {
      fresh: { card: "#ecfdf5", border: "#86efac", text: "#166534", subtle: "#15803d" },
      future: { card: "#eff6ff", border: "#93c5fd", text: "#1e3a8a", subtle: "#1d4ed8" },
      neutral: { card: "#f8fafc", border: "#cbd5e1", text: "#0f172a", subtle: "#334155" },
      stale: { card: "#fffbeb", border: "#fcd34d", text: "#78350f", subtle: "#92400e" },
      urgent: { card: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", subtle: "#991b1b" },
    },
  },
};

const tintColorLight = AppThemes.light.colors.primary;
const tintColorDark = AppThemes.dark.colors.primary;

export const Colors = {
  dark: {
    background: AppThemes.dark.colors.background,
    icon: AppThemes.dark.colors.textMuted,
    tabIconDefault: AppThemes.dark.colors.textMuted,
    tabIconSelected: tintColorDark,
    text: AppThemes.dark.colors.text,
    tint: tintColorDark,
  },
  light: {
    background: AppThemes.light.colors.background,
    icon: AppThemes.light.colors.textMuted,
    tabIconDefault: AppThemes.light.colors.textMuted,
    tabIconSelected: tintColorLight,
    text: AppThemes.light.colors.text,
    tint: tintColorLight,
  },
};

export const Fonts = Platform.select({
  default: {
    mono: "monospace",
    rounded: "normal",
    sans: "normal",
    serif: "serif",
  },
  ios: {
    mono: "ui-monospace",
    rounded: "ui-rounded",
    sans: "system-ui",
    serif: "ui-serif",
  },
  web: {
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    rounded: "'Avenir Next', 'SF Pro Rounded', 'Segoe UI', sans-serif",
    sans: "'Avenir Next', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  },
});
