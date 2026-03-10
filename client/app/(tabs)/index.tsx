import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import FeedingButton from "@/components/feeding-button";
import LastFedBanner from "@/components/last-fed-banner";
import { getLatestFeeding, type LatestFeeding } from "@/api/feeding";

export default function HomeScreen() {
  const [latest, setLatest] = useState<LatestFeeding | null>(null);

  const loadLatest = useCallback(async () => {
    const data = await getLatestFeeding();
    setLatest(data);
  }, []);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  return (
    <View style={styles.container}>
      <LastFedBanner latest={latest} />
      <FeedingButton onAdded={loadLatest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
});
