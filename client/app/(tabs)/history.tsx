import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { deleteFeeding, getFeedingsByDay, type FeedingDisplay } from "@/api/feeding";
import HistoryDatePicker from "../../components/history-date-picker";

const pad = (n: number) => String(n).padStart(2, "0");
const toDayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

function formatHeaderDate(dayKey: string) {
  const date = parseDayKey(dayKey);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFeedTime(dt: string) {
  const date = new Date(dt);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export default function History() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [items, setItems] = useState<FeedingDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const selectedKey = useMemo(() => toDayKey(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => toDayKey(new Date()), []);
  const canGoNext = selectedKey < todayKey;

  const loadDay = useCallback(async (dayKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getFeedingsByDay(dayKey);
      setItems(rows);
    } catch {
      setError("Could not load this day.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDay(selectedKey);
  }, [loadDay, selectedKey]);

  const goPrev = () => {
    setSelectedDate((curr) => {
      const next = new Date(curr);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const goNext = () => {
    setSelectedDate((curr) => {
      const next = new Date(curr);
      next.setDate(next.getDate() + 1);
      return toDayKey(next) > todayKey ? curr : next;
    });
  };

  const onDelete = async (id: number) => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Delete this feeding?")
        : await new Promise<boolean>((resolve) => {
            Alert.alert("Delete feeding", "This cannot be undone.", [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "Delete", style: "destructive", onPress: () => resolve(true) },
            ]);
          });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteFeeding(id);
      setItems((curr) => curr.filter((x) => x.id !== id));
    } catch {
      setError("Failed to delete feeding.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.page}>
      <View style={styles.column}>
        <View style={styles.topCard}>
          <Text style={styles.title}>Feeding History</Text>

          <View style={styles.navRow}>
            <Pressable style={({ pressed }) => [styles.arrowBtn, pressed && styles.btnPressed]} onPress={goPrev}>
              <Text style={styles.arrowText}>{"<"}</Text>
            </Pressable>

            <Text style={styles.dateLabel}>{formatHeaderDate(selectedKey)}</Text>

            <Pressable
              disabled={!canGoNext}
              style={({ pressed }) => [
                styles.arrowBtn,
                !canGoNext && styles.disabled,
                pressed && canGoNext && styles.btnPressed,
              ]}
              onPress={goNext}
            >
              <Text style={styles.arrowText}>{">"}</Text>
            </Pressable>
          </View>

          <HistoryDatePicker
            label="Date"
            maxDate={new Date()}
            onChange={setSelectedDate}
            value={selectedDate}
          />
        </View>

        <View style={styles.listCard}>
          {loading ? <Text style={styles.meta}>Loading feedings...</Text> : null}
          {!loading && items.length === 0 ? <Text style={styles.meta}>No feedings for this day.</Text> : null}

          {!!error ? <Text style={styles.error}>{error}</Text> : null}

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={styles.desc}>{item.feed_description}</Text>
                  <Pressable
                    onPress={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      pressed && styles.btnPressed,
                      deletingId === item.id && styles.disabled,
                    ]}
                  >
                    <Text style={styles.deleteText}>{deletingId === item.id ? "..." : "Delete"}</Text>
                  </Pressable>
                </View>
                <Text style={styles.meta}>Time: {formatFeedTime(item.date_time)}</Text>
                <Text style={styles.meta}>By: {item.user_name || `User #${item.user_id}`}</Text>
                <Text style={styles.meta}>Notes: {item.notes?.trim() ? item.notes : "-"}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    arrowBtn: {
      alignItems: "center",
      backgroundColor: c.secondary,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 44,
      minWidth: 44,
    },
    arrowText: {
      color: c.textSoft,
      fontFamily: Fonts?.rounded,
      fontSize: 18,
      fontWeight: "700",
    },
    btnPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
    },
    column: {
      flex: 1,
      gap: 14,
      maxWidth: 520,
      overflow: "visible",
      width: "100%",
    },
    dateLabel: {
      color: c.textSoft,
      flex: 1,
      fontFamily: Fonts?.sans,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    deleteBtn: {
      alignItems: "center",
      backgroundColor: c.dangerSoft,
      borderColor: c.danger,
      borderRadius: 8,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 36,
      minWidth: 64,
      paddingHorizontal: 10,
    },
    deleteText: {
      color: c.dangerText,
      fontFamily: Fonts?.rounded,
      fontSize: 13,
      fontWeight: "800",
    },
    desc: {
      color: c.text,
      flex: 1,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      fontWeight: "700",
    },
    disabled: {
      opacity: 0.45,
    },
    error: {
      color: c.danger,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    item: {
      backgroundColor: c.surface,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      padding: 12,
    },
    itemTop: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
      marginBottom: 6,
    },
    listCard: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      flex: 1,
      minHeight: 0,
      padding: 14,
      position: "relative",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.card.y },
      shadowOpacity: theme.shadow.card.opacity,
      shadowRadius: theme.shadow.card.radius,
      zIndex: 1,
      elevation: theme.shadow.card.elevation,
    },
    listContent: {
      gap: 10,
      paddingBottom: 12,
    },
    listScroll: {
      flex: 1,
    },
    meta: {
      color: c.textMuted,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },
    navRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
      marginBottom: 10,
    },
    page: {
      alignItems: "center",
      backgroundColor: c.background,
      flex: 1,
      paddingBottom: 16,
      padding: 16,
    },
    safe: {
      backgroundColor: c.background,
      flex: 1,
    },
    title: {
      color: c.text,
      fontFamily: Fonts?.rounded,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 10,
    },
    topCard: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      overflow: "visible",
      padding: 14,
      position: "relative",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.card.y },
      shadowOpacity: theme.shadow.card.opacity,
      shadowRadius: theme.shadow.card.radius,
      zIndex: 30,
      elevation: theme.shadow.card.elevation,
    },
  });
}
