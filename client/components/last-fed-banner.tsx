import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LatestFeeding } from "@/api/feeding";

type Props = {
  latest: LatestFeeding | null;
  loading?: boolean;
};

type Tone = {
  card: string;
  border: string;
  text: string;
  subtle: string;
};

const tones: Record<"fresh" | "stale" | "urgent" | "future" | "neutral", Tone> = {
  fresh: { card: "#ecfdf5", border: "#86efac", text: "#14532d", subtle: "#166534" },
  stale: { card: "#fffbeb", border: "#fcd34d", text: "#78350f", subtle: "#92400e" },
  urgent: { card: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", subtle: "#991b1b" },
  future: { card: "#eff6ff", border: "#93c5fd", text: "#1e3a8a", subtle: "#1d4ed8" },
  neutral: { card: "#f8fafc", border: "#cbd5e1", text: "#0f172a", subtle: "#334155" },
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

function getTone(deltaSeconds: number): Tone {
  if (deltaSeconds < 0) return tones.future;
  const hours = deltaSeconds / 3600;
  if (hours < 2) return tones.fresh;
  if (hours < 5) return tones.stale;
  return tones.urgent;
}

export default function LastFedBanner({ latest, loading = false }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const model = useMemo(() => {
    if (!latest) return null;
    const fedDate = new Date(latest.date_time);
    const deltaSeconds = Math.floor((nowMs - fedDate.getTime()) / 1000);
    return {
      relative: formatRelative(deltaSeconds),
      absolute: formatAbsolute(fedDate),
      user: latest.user_name || "Unknown user",
      tone: getTone(deltaSeconds),
    };
  }, [latest, nowMs]);

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
    return (
      <View style={[styles.card, { backgroundColor: tones.neutral.card, borderColor: tones.neutral.border }]}>
        <Text style={[styles.relativeText, { color: tones.neutral.text }]}>No feedings logged yet</Text>
        <Text style={[styles.metaText, { color: tones.neutral.subtle }]}>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: "100%",
  },
  relativeText: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 36,
    textAlign: "center",
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  byLine: {
    marginTop: 6,
  },
  loadingCard: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  skeletonHeadline: {
    backgroundColor: "#cbd5e1",
    borderRadius: 8,
    height: 34,
    marginBottom: 10,
    width: "82%",
    alignSelf: "center",
  },
  skeletonLine: {
    backgroundColor: "#dbe4ef",
    borderRadius: 8,
    height: 14,
    marginBottom: 8,
    width: "56%",
    alignSelf: "center",
  },
  skeletonLineShort: {
    backgroundColor: "#dbe4ef",
    borderRadius: 8,
    height: 14,
    width: "38%",
    alignSelf: "center",
  },
});
