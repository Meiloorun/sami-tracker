import { useCallback, useMemo } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SettingsRow from "@/components/settings-row";
import { Fonts, type AppTheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { clearSession } from "@/lib/session";
import type { SettingItem } from "@/types/settings";

export default function SettingsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const confirmSignOut = useCallback(async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Sign out from this device?");
      if (!confirmed) return;
      await clearSession();
      router.replace("/onboarding");
      return;
    }

    Alert.alert("Sign out", "Sign out from this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          router.replace("/onboarding");
        },
      },
    ]);
  }, []);

  const settingItems: SettingItem[] = useMemo(
    () => [
      {
        id: "sign-out",
        type: "action",
        title: "Sign out",
        subtitle: "Clear this device session and return to onboarding",
        danger: true,
        onPress: confirmSignOut,
      },
    ],
    [confirmSignOut],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.page}>
        <View style={styles.column}>
          <Text style={styles.heading}>Settings</Text>

          <View style={styles.card}>
            {settingItems.map((item, index) => (
              <SettingsRow
                key={item.id}
                item={item}
                showDivider={index < settingItems.length - 1}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;

  return StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderColor: c.borderSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: theme.shadow.card.y },
      shadowOpacity: theme.shadow.card.opacity,
      shadowRadius: theme.shadow.card.radius,
      elevation: theme.shadow.card.elevation,
    },
    column: {
      maxWidth: 520,
      width: "100%",
    },
    heading: {
      color: c.text,
      fontFamily: Fonts?.rounded,
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 14,
    },
    page: {
      alignItems: "center",
      backgroundColor: c.background,
      flex: 1,
      padding: 16,
    },
    safe: {
      backgroundColor: c.background,
      flex: 1,
    },
  });
}
