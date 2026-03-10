import { useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addFeeding } from "@/api/feeding";

const pad = (n: number) => String(n).padStart(2, "0");
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

type Props = { onAdded: () => void | Promise<void> };

export default function FeedingButton({ onAdded }: Props) {
  const isWeb = Platform.OS === "web";
  const [open, setOpen] = useState(false);
  const [feedDescription, setFeedDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [dateValue, setDateValue] = useState(toDateInput(new Date()));
  const [timeValue, setTimeValue] = useState(toTimeInput(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openForm = () => {
    const now = new Date();
    setSelectedDateTime(now);
    setDateValue(toDateInput(now));
    setTimeValue(toTimeInput(now));
    setFeedDescription("");
    setNotes("");
    setError(null);
    setOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setOpen(false);
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (!date) return;

    const next = new Date(selectedDateTime);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateTime(next);
  };

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (!date) return;

    const next = new Date(selectedDateTime);
    next.setHours(date.getHours(), date.getMinutes(), next.getSeconds(), 0);
    setSelectedDateTime(next);
  };

  const submit = async () => {
    const description = feedDescription.trim();
    if (!description) {
      setError("Feed description is required.");
      return;
    }

    const webTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    const dt = isWeb ? new Date(`${dateValue}T${webTime}`) : selectedDateTime;
    if (Number.isNaN(dt.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addFeeding(description, dt, notes.trim() || undefined);
      await onAdded?.();
      setOpen(false);
    } catch {
      setError("Could not save feeding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.mainButton} onPress={openForm}>
        <Text style={styles.mainButtonText}>I just fed Sami</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={closeForm}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeForm} />
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Log Feeding</Text>
              <Pressable onPress={closeForm}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.label}>Date</Text>
                {isWeb ? (
                  <input
                    type="date"
                    style={styles.webInput as any}
                    value={dateValue}
                    onChange={(event) => setDateValue(event.currentTarget.value)}
                    disabled={saving}
                    aria-label="Feeding date"
                  />
                ) : (
                  <Pressable
                    style={styles.input}
                    disabled={saving}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.pickerValue}>
                      {selectedDateTime.toLocaleDateString()}
                    </Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.flex}>
                <Text style={styles.label}>Time</Text>
                {isWeb ? (
                  <input
                    type="time"
                    style={styles.webInput as any}
                    value={timeValue}
                    onChange={(event) => setTimeValue(event.currentTarget.value)}
                    step={1}
                    disabled={saving}
                    aria-label="Feeding time"
                  />
                ) : (
                  <Pressable
                    style={styles.input}
                    disabled={saving}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.pickerValue}>
                      {selectedDateTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {!isWeb && showDatePicker && (
              <DateTimePicker value={selectedDateTime} mode="date" onChange={onDateChange} />
            )}
            {!isWeb && showTimePicker && (
              <DateTimePicker value={selectedDateTime} mode="time" onChange={onTimeChange} />
            )}

            <Text style={styles.label}>Feed description *</Text>
            <TextInput
              style={styles.input}
              value={feedDescription}
              onChangeText={setFeedDescription}
              placeholder="e.g. Half pouch wet food"
              editable={!saving}
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any extra details"
              multiline
              editable={!saving}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.submitButton, (!feedDescription.trim() || saving) && styles.disabled]}
              disabled={!feedDescription.trim() || saving}
              onPress={submit}
            >
              <Text style={styles.submitText}>{saving ? "Saving..." : "Add feed"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mainButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  mainButtonText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 18 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  closeText: { color: "#1E90FF", fontWeight: "600" },
  label: { fontSize: 13, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  webInput: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    width: "100%",
  },
  pickerValue: { color: "#111", fontSize: 16 },
  notesInput: { minHeight: 72, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  error: { color: "#b91c1c", fontSize: 13 },
  submitButton: {
    marginTop: 4,
    backgroundColor: "#1E90FF",
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.5 },
});
