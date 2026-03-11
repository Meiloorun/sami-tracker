import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Fonts, type AppTheme } from "@/constants/theme";
import FeedingButton from "@/components/feeding-button";
import LastFedBanner from "@/components/last-fed-banner";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  deleteFeeding,
  getLatestFeeding,
  getRecentFeedings,
  type FeedingDisplay,
  type FeedingRecord,
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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [latest, setLatest] = useState<FeedingDisplay | null>(null);
  const [recent, setRecent] = useState<FeedingDisplay[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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
      const [latestData, recentData] = await Promise.all([getLatestFeeding(), getRecentFeedings(3)]);
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

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
      const intervalId = setInterval(() => {
        loadHomeData();
      }, 30_000);

      return () => clearInterval(intervalId);
    }, [loadHomeData]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        loadHomeData();
      }
    });

    return () => sub.remove();
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

  const onPullRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHomeData();
    } finally {
      setRefreshing(false);
    }
  }, [loadHomeData]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onPullRefresh}
              tintColor={theme.colors.primary}
            />
          }
          style={styles.scroll}
        >
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
        </ScrollView>

        {snackbar && (
          <View style={[styles.snackbar, { bottom: 16 + insets.bottom }]}>
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
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    column: {
      maxWidth: 520,
      width: "100%",
    },
    emptyText: {
      color: c.textMuted,
      fontFamily: Fonts?.sans,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
    errorText: {
      color: c.danger,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 12,
    },
    page: {
      alignItems: "center",
      backgroundColor: c.background,
      flex: 1,
      paddingBottom: 16,
      padding: 16,
    },
    recentCard: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      marginTop: 18,
      padding: 16,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.card.y },
      shadowOpacity: theme.shadow.card.opacity,
      shadowRadius: theme.shadow.card.radius,
      elevation: theme.shadow.card.elevation,
    },
    recentDescription: {
      color: c.textSoft,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      fontWeight: "700",
    },
    recentList: {
      gap: 12,
    },
    recentLoadingWrap: {
      gap: 10,
    },
    recentMeta: {
      color: c.textMuted,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },
    recentRow: {
      borderBottomColor: c.muted,
      borderBottomWidth: 1,
      paddingBottom: 10,
    },
    recentSkeleton: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 8,
      height: 20,
      width: "100%",
    },
    recentSkeletonShort: {
      backgroundColor: c.mutedStrong,
      borderRadius: 8,
      height: 20,
      width: "75%",
    },
    scroll: {
      flex: 1,
      width: "100%",
    },
    scrollContent: {
      alignItems: "center",
      paddingBottom: 96,
    },
    recentTitle: {
      color: c.text,
      fontFamily: Fonts?.rounded,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 10,
    },
    snackbar: {
      alignItems: "center",
      backgroundColor: c.cardAlt,
      borderColor: c.borderStrong,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      bottom: 16,
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      maxWidth: 520,
      paddingHorizontal: 14,
      paddingVertical: 12,
      position: "absolute",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.pop.y },
      shadowOpacity: theme.shadow.pop.opacity,
      shadowRadius: theme.shadow.pop.radius,
      width: "100%",
      elevation: theme.shadow.pop.elevation,
    },
    snackbarText: {
      color: c.text,
      flex: 1,
      fontFamily: Fonts?.sans,
      fontSize: 14,
      fontWeight: "700",
    },
    snackbarUndo: {
      alignItems: "center",
      backgroundColor: c.primary,
      borderRadius: 10,
      justifyContent: "center",
      minHeight: 44,
      minWidth: 72,
      paddingHorizontal: 12,
    },
    snackbarUndoPressed: {
      backgroundColor: c.primaryPressed,
    },
    snackbarUndoText: {
      color: c.primaryText,
      fontFamily: Fonts?.rounded,
      fontSize: 14,
      fontWeight: "800",
    },
    safe: {
      backgroundColor: c.background,
      flex: 1,
    },
  });
}
