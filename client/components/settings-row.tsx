import { useMemo } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { SettingItem } from "@/types/settings";

type Props = {
  item: SettingItem;
  showDivider?: boolean;
};

export default function SettingsRow({ item, showDivider = true }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = theme.colors;

  const handlePress = () => {
    if (item.disabled) return;

    if (item.type === "toggle") {
      item.onValueChange(!item.value);
      return;
    }

    item.onPress();
  };

  const rightContent =
    item.type === "toggle" ? (
      <Switch
        value={item.value}
        onValueChange={item.onValueChange}
        disabled={item.disabled}
        trackColor={{ false: c.mutedStrong, true: c.primary }}
        thumbColor={item.value ? c.primaryText : c.card}
      />
    ) : (
      <View style={styles.rightWrap}>
        {!!item.rightLabel && <Text style={styles.rightLabel}>{item.rightLabel}</Text>}
        <Text style={styles.chevron}>{">"}</Text>
      </View>
    );

  return (
    <Pressable
      onPress={handlePress}
      disabled={item.disabled}
      accessibilityRole={item.type === "toggle" ? "switch" : "button"}
      accessibilityState={
        item.type === "toggle"
          ? { checked: item.value, disabled: item.disabled }
          : { disabled: item.disabled }
      }
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.rowDivider,
        item.disabled && styles.disabled,
        pressed && !item.disabled && styles.pressed,
      ]}
    >
      <View style={styles.leftWrap}>
        <Text style={[styles.title, item.type === "action" && item.danger && styles.dangerTitle]}>
          {item.title}
        </Text>
        {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </View>

      {rightContent}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;

  return StyleSheet.create({
    chevron: {
      color: c.textMuted,
      fontSize: 20,
      lineHeight: 20,
    },
    dangerTitle: {
      color: c.danger,
    },
    disabled: {
      opacity: 0.5,
    },
    leftWrap: {
      flex: 1,
      gap: 4,
    },
    pressed: {
      backgroundColor: c.surfaceAlt,
    },
    rightLabel: {
      color: c.textMuted,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "600",
    },
    rightWrap: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    row: {
      alignItems: "center",
      backgroundColor: c.card,
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rowDivider: {
      borderBottomColor: c.borderSoft,
      borderBottomWidth: 1,
    },
    subtitle: {
      color: c.textMuted,
      fontFamily: Fonts?.sans,
      fontSize: 13,
      fontWeight: "500",
    },
    title: {
      color: c.text,
      fontFamily: Fonts?.rounded,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
