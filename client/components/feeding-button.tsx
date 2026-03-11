import { useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addFeeding, type FeedingRecord } from "@/api/feeding";
import HistoryDatePicker from "./history-date-picker";

const NOTES_LIMIT = 220;
const QUICK_ACTIONS = [
  { label: "Half pack", value: "Half pack wet food" },
  { label: "Chicken Bowl", value: "Bowl of Chicken" },
  { label: "Full pack", value: "Full pack wet food" },
  { label: "Dry food", value: "Dry food refill" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

type Props = {
  onAdded?: (feeding: FeedingRecord) => void | Promise<void>;
};

export default function FeedingButton({ onAdded }: Props) {
  const isWeb = Platform.OS === "web";
  const [open, setOpen] = useState(false);
  const [feedDescription, setFeedDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [timeValue, setTimeValue] = useState(toTimeInput(new Date()));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notesCount = useMemo(() => notes.length, [notes]);

  const openForm = (prefillDescription?: string) => {
    const now = new Date();
    setSelectedDateTime(now);
    setTimeValue(toTimeInput(now));
    setFeedDescription(prefillDescription ?? "");
    setNotes("");
    setError(null);
    setOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setOpen(false);
  };

  const onDateChange = (date: Date) => {
    const next = new Date(selectedDateTime);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateTime(next);
  };

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (!date) return;

    const next = new Date(selectedDateTime);
    next.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), 0);
    setSelectedDateTime(next);
  };

  const submit = async () => {
    const description = feedDescription.trim();
    if (!description) {
      setError("Feed description is required.");
      return;
    }

    const webTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    const feedingDate = isWeb
      ? new Date(`${toDateInput(selectedDateTime)}T${webTime}`)
      : selectedDateTime;
    if (Number.isNaN(feedingDate.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await addFeeding(description, feedingDate, notes.trim() || undefined);
      await onAdded?.(created);
      setOpen(false);
    } catch {
      setError("Could not save feeding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View style={styles.quickActionRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Quick log ${action.label}`}
            key={action.label}
            onPress={() => openForm(action.value)}
            style={({ pressed }) => [styles.quickActionChip, pressed && styles.quickActionChipPressed]}
          >
            <Text style={styles.quickActionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log Feeding"
        onPress={() => openForm()}
        style={({ pressed }) => [styles.mainButton, pressed && styles.mainButtonPressed]}
      >
        <Text style={styles.mainButtonTitle}>Log Feeding</Text>
        <Text style={styles.mainButtonSubtitle}>I just fed Sami</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={closeForm}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeForm} />
          <View style={[styles.card, isWeb && styles.cardWeb]}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Log Feeding</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close feeding form"
                style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                onPress={closeForm}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              style={[styles.formScroll, isWeb && styles.formScrollWeb]}
            >
              <View style={styles.row}>
                <View style={styles.flex}>
                  <HistoryDatePicker
                    disabled={saving}
                    label="Date"
                    onChange={onDateChange}
                    value={selectedDateTime}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.label}>Time</Text>
                  {isWeb ? (
                    <input
                      aria-label="Feeding time"
                      disabled={saving}
                      onChange={(event) => setTimeValue(event.currentTarget.value)}
                      step={1}
                      style={{ ...(styles.webInput as any), boxSizing: "border-box" }}
                      type="time"
                      value={timeValue}
                    />
                  ) : (
                    <Pressable
                      accessibilityLabel="Select feeding time"
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => setShowTimePicker(true)}
                      style={styles.input}
                    >
                      <Text style={styles.pickerValue}>
                        {selectedDateTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {!isWeb && showTimePicker && (
                <DateTimePicker mode="time" onChange={onTimeChange} value={selectedDateTime} />
              )}

              <Text style={styles.label}>Feed description *</Text>
              <TextInput
                accessibilityLabel="Feed description"
                editable={!saving}
                onChangeText={setFeedDescription}
                placeholder="e.g. Half pack wet food"
                style={styles.input}
                value={feedDescription}
              />

              <View style={styles.notesHeader}>
                <Text style={styles.label}>Notes (optional)</Text>
                <Text style={styles.notesCounter}>
                  {notesCount}/{NOTES_LIMIT}
                </Text>
              </View>
              <TextInput
                accessibilityLabel="Feeding notes"
                editable={!saving}
                maxLength={NOTES_LIMIT}
                multiline
                onChangeText={setNotes}
                placeholder="Any extra details"
                style={[styles.input, styles.notesInput]}
                value={notes}
              />
            </ScrollView>

            <View style={styles.footer}>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add feeding"
                disabled={!feedDescription.trim() || saving}
                onPress={submit}
                style={({ pressed }) => [
                  styles.submitButton,
                  (!feedDescription.trim() || saving) && styles.disabled,
                  pressed && !saving && styles.submitPressed,
                ]}
              >
                <Text style={styles.submitText}>{saving ? "Saving..." : "Add feed"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  quickActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 14,
    width: "100%",
  },
  quickActionChip: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  quickActionChipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  quickActionText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
  },
  mainButton: {
    alignItems: "center",
    backgroundColor: "#0369a1",
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 168,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: "#0c4a6e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    width: "100%",
    elevation: 8,
  },
  mainButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  mainButtonTitle: {
    color: "#f8fafc",
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  mainButtonSubtitle: {
    color: "#e0f2fe",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
  overlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.5)",
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 18,
    maxHeight: "88%",
    maxWidth: 520,
    overflow: "hidden",
    width: "100%",
  },
  cardWeb: {
    overflow: "visible",
  },
  headerRow: {
    alignItems: "center",
    borderBottomColor: "#334155",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "800",
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 74,
  },
  closeButtonPressed: {
    backgroundColor: "#1e293b",
  },
  closeText: {
    color: "#bae6fd",
    fontSize: 15,
    fontWeight: "700",
  },
  formScroll: {
    maxHeight: 420,
  },
  formScrollWeb: {
    overflow: "visible",
  },
  formContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  flex: {
    flex: 1,
    minWidth: 180,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0b1220",
    borderColor: "#475569",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fafc",
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  webInput: {
    backgroundColor: "#0b1220",
    borderColor: "#475569",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fafc",
    fontSize: 16,
    minHeight: 44,
    padding: 10,
    width: "100%",
  },
  pickerValue: {
    color: "#f8fafc",
    fontSize: 16,
  },
  notesHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notesCounter: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  footer: {
    borderTopColor: "#334155",
    borderTopWidth: 1,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#0369a1",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 50,
  },
  submitPressed: {
    opacity: 0.92,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.45,
  },
});
