import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { FeedingDisplay } from "@/api/feeding";

type Props = {
  latest: FeedingDisplay | null;
  loading?: boolean;
};

function formatRelative(deltaSeconds: number) {
  const abs = Math.abs(deltaSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  const suffix = deltaSeconds >= 0 ? "ago" : "from now";
  return `${hours}h ${minutes}m ${seconds}s ${suffix}`;
}

function formatAbsolute(date: Date) {
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  const dayPart = isToday
    ? "Today"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${dayPart} ${timePart}`;
}

function getToneName(deltaSeconds: number): keyof AppTheme["status"] {
  if (deltaSeconds < 0) return "future";
  const hours = deltaSeconds / 3600;
  if (hours < 2) return "fresh";
  if (hours < 5) return "stale";
  return "urgent";
}

export default function LastFedBanner({ latest, loading = false }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const model = useMemo(() => {
    if (!latest) return null;
    const fedDate = new Date(latest.date_time);
    const deltaSeconds = Math.floor((nowMs - fedDate.getTime()) / 1000);
    const tone = theme.status[getToneName(deltaSeconds)];
    return {
      absolute: formatAbsolute(fedDate),
      relative: formatRelative(deltaSeconds),
      tone,
      user: latest.user_name || "Unknown user",
    };
  }, [latest, nowMs, theme.status]);

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <View style={styles.skeletonHeadline} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    );
  }

  if (!model) {
    const neutral = theme.status.neutral;
    return (
      <View style={[styles.card, { backgroundColor: neutral.card, borderColor: neutral.border }]}>
        <Text style={[styles.relativeText, { color: neutral.text }]}>No feedings logged yet</Text>
        <Text style={[styles.metaText, { color: neutral.subtle }]}>
          Add the first feeding to start tracking.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: model.tone.card, borderColor: model.tone.border }]}>
      <Text style={[styles.relativeText, { color: model.tone.text }]}>Sami was last fed {model.relative}</Text>
      <Text style={[styles.metaText, { color: model.tone.subtle }]}>{model.absolute}</Text>
      <Text style={[styles.metaText, styles.byLine, { color: model.tone.subtle }]}>by {model.user}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    byLine: {
      marginTop: 6,
    },
    card: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      marginBottom: 18,
      paddingHorizontal: 18,
      paddingVertical: 16,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.card.y },
      shadowOpacity: theme.shadow.card.opacity,
      shadowRadius: theme.shadow.card.radius,
      width: "100%",
      elevation: theme.shadow.card.elevation,
    },
    loadingCard: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
    },
    metaText: {
      fontFamily: Fonts?.sans,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 8,
      textAlign: "center",
    },
    relativeText: {
      fontFamily: Fonts?.rounded,
      fontSize: theme.sizes.hero,
      fontWeight: "800",
      letterSpacing: -0.4,
      lineHeight: 36,
      textAlign: "center",
    },
    skeletonHeadline: {
      alignSelf: "center",
      backgroundColor: c.mutedStrong,
      borderRadius: 8,
      height: 34,
      marginBottom: 10,
      width: "82%",
    },
    skeletonLine: {
      alignSelf: "center",
      backgroundColor: c.muted,
      borderRadius: 8,
      height: 14,
      marginBottom: 8,
      width: "56%",
    },
    skeletonLineShort: {
      alignSelf: "center",
      backgroundColor: c.muted,
      borderRadius: 8,
      height: 14,
      width: "38%",
    },
  });
}
