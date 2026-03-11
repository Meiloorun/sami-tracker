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
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
            accessibilityLabel={`Quick log ${action.label}`}
            accessibilityRole="button"
            key={action.label}
            onPress={() => openForm(action.value)}
            style={({ pressed }) => [styles.quickActionChip, pressed && styles.quickActionChipPressed]}
          >
            <Text style={styles.quickActionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityLabel="Log Feeding"
        accessibilityRole="button"
        onPress={() => openForm()}
        style={({ pressed }) => [styles.mainButton, pressed && styles.mainButtonPressed]}
      >
        <Text style={styles.mainButtonTitle}>Log Feeding</Text>
        <Text style={styles.mainButtonSubtitle}>I just fed Sami</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={closeForm}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeForm} />
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Log Feeding</Text>
              <Pressable
                accessibilityLabel="Close feeding form"
                accessibilityRole="button"
                style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                onPress={closeForm}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              style={styles.formScroll}
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
                placeholderTextColor={theme.colors.textMuted}
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
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.notesInput]}
                value={notes}
              />
            </ScrollView>

            <View style={styles.footer}>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <Pressable
                accessibilityLabel="Add feeding"
                accessibilityRole="button"
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

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.overlay,
    },
    card: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      elevation: theme.shadow.pop.elevation,
      maxHeight: "88%",
      maxWidth: 520,
      overflow: "visible",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.pop.y },
      shadowOpacity: theme.shadow.pop.opacity,
      shadowRadius: theme.shadow.pop.radius,
      width: "100%",
    },
    closeButton: {
      alignItems: "center",
      borderRadius: theme.radius.sm,
      justifyContent: "center",
      minHeight: 44,
      minWidth: 74,
    },
    closeButtonPressed: {
      backgroundColor: c.muted,
    },
    closeText: {
      color: c.textSoft,
      fontFamily: Fonts?.rounded,
      fontSize: 15,
      fontWeight: "700",
    },
    disabled: {
      opacity: 0.45,
    },
    error: {
      color: c.danger,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "600",
    },
    flex: {
      flex: 1,
      minWidth: 180,
    },
    footer: {
      borderTopColor: c.borderSoft,
      borderTopWidth: 1,
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    formContent: {
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    formScroll: {
      maxHeight: 420,
      overflow: "visible",
    },
    headerRow: {
      alignItems: "center",
      borderBottomColor: c.borderSoft,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    input: {
      backgroundColor: c.input,
      borderColor: c.inputBorder,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      color: c.text,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    label: {
      color: c.textSoft,
      fontFamily: Fonts?.sans,
      fontSize: theme.sizes.label,
      fontWeight: "700",
      marginBottom: 6,
    },
    mainButton: {
      alignItems: "center",
      backgroundColor: c.primary,
      borderColor: c.ring,
      borderRadius: 24,
      borderWidth: 1,
      elevation: theme.shadow.pop.elevation,
      justifyContent: "center",
      minHeight: 168,
      paddingHorizontal: 24,
      paddingVertical: 20,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.pop.y },
      shadowOpacity: theme.shadow.pop.opacity,
      shadowRadius: theme.shadow.pop.radius,
      width: "100%",
    },
    mainButtonPressed: {
      backgroundColor: c.primaryPressed,
      transform: [{ scale: 0.985 }],
    },
    mainButtonSubtitle: {
      color: c.primaryText,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      fontWeight: "600",
      marginTop: 6,
      opacity: 0.95,
    },
    mainButtonTitle: {
      color: c.primaryText,
      fontFamily: Fonts?.rounded,
      fontSize: theme.sizes.hero,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    notesCounter: {
      color: c.textMuted,
      fontFamily: Fonts?.mono,
      fontSize: 12,
      fontWeight: "700",
    },
    notesHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    notesInput: {
      minHeight: 92,
      textAlignVertical: "top",
    },
    overlay: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      padding: 16,
    },
    pickerValue: {
      color: c.text,
      fontFamily: Fonts?.sans,
      fontSize: 16,
    },
    quickActionChip: {
      alignItems: "center",
      backgroundColor: c.secondary,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 44,
      minWidth: 96,
      paddingHorizontal: 14,
    },
    quickActionChipPressed: {
      backgroundColor: c.surfaceAlt,
      transform: [{ scale: 0.98 }],
    },
    quickActionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      marginBottom: 14,
      width: "100%",
    },
    quickActionText: {
      color: c.textSoft,
      fontFamily: Fonts?.rounded,
      fontSize: 14,
      fontWeight: "700",
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    submitButton: {
      alignItems: "center",
      backgroundColor: c.primary,
      borderRadius: theme.radius.md,
      justifyContent: "center",
      minHeight: 50,
    },
    submitPressed: {
      backgroundColor: c.primaryPressed,
    },
    submitText: {
      color: c.primaryText,
      fontFamily: Fonts?.rounded,
      fontSize: 17,
      fontWeight: "800",
    },
    title: {
      color: c.text,
      fontFamily: Fonts?.rounded,
      fontSize: theme.sizes.title,
      fontWeight: "800",
    },
    webInput: {
      backgroundColor: c.input,
      borderColor: c.inputBorder,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      color: c.text,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      minHeight: 44,
      padding: 10,
      width: "100%",
    },
  });
}
