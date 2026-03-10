import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import FeedingButton from "@/components/feeding-button";
import LastFedBanner from "@/components/last-fed-banner";
import {
  deleteFeeding,
  getLatestFeeding,
  getRecentFeedings,
  type FeedingRecord,
  type LatestFeeding,
} from "@/api/feeding";

type SnackbarState = {
  message: string;
  undoId?: number;
};

function formatRecentDate(dateTime: string) {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  const dayPart = sameDay
    ? "Today"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${dayPart} ${timePart}`;
}

export default function HomeScreen() {
  const [latest, setLatest] = useState<LatestFeeding | null>(null);
  const [recent, setRecent] = useState<LatestFeeding[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback((message: string, undoId?: number) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSnackbar({ message, undoId });
    hideTimerRef.current = setTimeout(() => setSnackbar(null), 5000);
  }, []);

  const loadHomeData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLatestLoading(true);
      setRecentLoading(true);
    }

    setLoadError(null);
    try {
      const [latestData, recentData] = await Promise.all([
        getLatestFeeding(),
        getRecentFeedings(3),
      ]);
      setLatest(latestData);
      setRecent(recentData);
    } catch {
      setLoadError("Could not load feeding data right now.");
    } finally {
      setLatestLoading(false);
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData(true);
  }, [loadHomeData]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleAdded = useCallback(
    async (created: FeedingRecord) => {
      showSnackbar("Feeding logged", created.id);
      await loadHomeData();
    },
    [loadHomeData, showSnackbar],
  );

  const handleUndo = useCallback(async () => {
    if (!snackbar?.undoId) return;

    try {
      await deleteFeeding(snackbar.undoId);
      setSnackbar(null);
      showSnackbar("Last feeding removed");
      await loadHomeData();
    } catch {
      showSnackbar("Could not undo feeding");
    }
  }, [loadHomeData, showSnackbar, snackbar?.undoId]);

  const hasRecentItems = useMemo(() => recent.length > 0, [recent]);

  return (
    <View style={styles.page}>
      <View style={styles.column}>
        <LastFedBanner latest={latest} loading={latestLoading} />
        <FeedingButton onAdded={handleAdded} />

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Recent Feedings</Text>

          {recentLoading ? (
            <View style={styles.recentLoadingWrap}>
              <View style={styles.recentSkeleton} />
              <View style={styles.recentSkeleton} />
              <View style={styles.recentSkeletonShort} />
            </View>
          ) : hasRecentItems ? (
            <View style={styles.recentList}>
              {recent.map((feeding) => (
                <View key={feeding.id} style={styles.recentRow}>
                  <Text style={styles.recentDescription}>{feeding.feed_description}</Text>
                  <Text style={styles.recentMeta}>
                    {formatRecentDate(feeding.date_time)} by {feeding.user_name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No recent feedings yet. Add one to get started.</Text>
          )}

          {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}
        </View>
      </View>

      {snackbar && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
          {!!snackbar.undoId && (
            <Pressable
              accessibilityLabel="Undo last feeding"
              accessibilityRole="button"
              onPress={handleUndo}
              style={({ pressed }) => [styles.snackbarUndo, pressed && styles.snackbarUndoPressed]}
            >
              <Text style={styles.snackbarUndoText}>Undo</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    backgroundColor: "#020617",
    flex: 1,
    padding: 16,
  },
  column: {
    maxWidth: 520,
    width: "100%",
  },
  recentCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  recentTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  recentLoadingWrap: {
    gap: 10,
  },
  recentSkeleton: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    height: 20,
    width: "100%",
  },
  recentSkeletonShort: {
    backgroundColor: "#334155",
    borderRadius: 8,
    height: 20,
    width: "75%",
  },
  recentList: {
    gap: 12,
  },
  recentRow: {
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  recentDescription: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
  },
  recentMeta: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  snackbar: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 12,
    bottom: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    maxWidth: 520,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    width: "100%",
  },
  snackbarText: {
    color: "#f8fafc",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  snackbarUndo: {
    alignItems: "center",
    backgroundColor: "#0369a1",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  snackbarUndoPressed: {
    opacity: 0.9,
  },
  snackbarUndoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
