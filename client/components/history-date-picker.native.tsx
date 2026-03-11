import { useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    disabled: {
      opacity: 0.55,
    },
    label: {
      color: c.textSoft,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 6,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    trigger: {
      alignItems: "center",
      backgroundColor: c.input,
      borderColor: c.inputBorder,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    triggerText: {
      color: c.text,
      fontFamily: Fonts?.sans,
      fontSize: 16,
      fontWeight: "600",
    },
    wrap: {
      width: "100%",
    },
  });
}
