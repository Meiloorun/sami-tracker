import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import OnboardingForm from "@/components/onboarding-form";
import { identify } from "@/api/auth";
import { getSession, setSession } from "@/lib/session";

export default function OnboardingScreen() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const session = await getSession();
      if (!isMounted) return;

      if (session) {
        router.replace("/(tabs)");
        return;
      }

      setCheckingSession(false);
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (email: string) => {
    const normalized = email.trim().toLowerCase();

    if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await identify(normalized);
      await setSession(session);
      router.replace("/(tabs)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sign in.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.container}>
        <OnboardingForm loading={loading} error={error} onSubmit={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f9fc" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loadingContainer: { alignItems: "center", flex: 1, justifyContent: "center" },
});
