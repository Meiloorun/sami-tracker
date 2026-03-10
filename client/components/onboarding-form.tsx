import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type OnboardingFormProps = {
  loading: boolean;
  error: string | null;
  onSubmit: (email: string) => Promise<void>;
};

export default function OnboardingForm({ loading, error, onSubmit }: OnboardingFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const normalized = email.trim().toLowerCase();
    await onSubmit(normalized);
  };

  const canSubmit = !loading && email.trim().length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Who&apos;s feeding Sami?</Text>
      <Text style={styles.subtitle}>Enter your family email to continue.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        editable={!loading}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", maxWidth: 360, gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  error: { color: "#b00020", fontSize: 13 },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
