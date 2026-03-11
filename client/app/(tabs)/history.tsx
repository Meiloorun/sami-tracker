import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
      Platform.OS === "web" ? window.confirm("Delete this feeding?") : await new Promise<boolean>((resolve) => {
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
              style={({ pressed }) => [styles.arrowBtn, !canGoNext && styles.disabled, pressed && canGoNext && styles.btnPressed]}
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

          <ScrollView contentContainerStyle={styles.listContent}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={styles.desc}>{item.feed_description}</Text>
                  <Pressable
                    onPress={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed, deletingId === item.id && styles.disabled]}
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
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#020617", alignItems: "center", padding: 16 },
  column: { width: "100%", maxWidth: 520, gap: 14, overflow: "visible" },
  topCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    overflow: "visible",
    position: "relative",
    zIndex: 30,
  },
  title: { color: "#f8fafc", fontSize: 20, fontWeight: "800", marginBottom: 10 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  arrowBtn: { minWidth: 44, minHeight: 44, borderRadius: 10, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" },
  arrowText: { color: "#e2e8f0", fontSize: 18, fontWeight: "700" },
  dateLabel: { color: "#e2e8f0", flex: 1, textAlign: "center", fontSize: 14, fontWeight: "700" },
  listCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  listContent: { gap: 10, paddingBottom: 6 },
  item: { backgroundColor: "#111827", borderColor: "#1f2937", borderWidth: 1, borderRadius: 12, padding: 12 },
  itemTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 },
  desc: { color: "#f8fafc", fontSize: 16, fontWeight: "700", flex: 1 },
  meta: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 2 },
  deleteBtn: { minHeight: 36, minWidth: 64, borderRadius: 8, backgroundColor: "#7f1d1d", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  deleteText: { color: "#fee2e2", fontSize: 13, fontWeight: "800" },
  error: { color: "#fca5a5", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  disabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});
