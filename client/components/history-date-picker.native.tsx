import { useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  label?: string;
  disabled?: boolean;
};

export default function HistoryDatePicker({
  value,
  onChange,
  maxDate,
  label = "Date",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const onNativeChange = (_event: DateTimePickerEvent, next?: Date) => {
    setOpen(false);
    if (next) onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel="Select history date"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
      >
        <Text style={styles.triggerText}>
          {value.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </Pressable>
      {open && !disabled && (
        <DateTimePicker
          mode="date"
          value={value}
          maximumDate={maxDate}
          onChange={onNativeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  trigger: {
    alignItems: "center",
    backgroundColor: "#0b1220",
    borderColor: "#475569",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
