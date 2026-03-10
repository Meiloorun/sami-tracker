import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { LatestFeeding } from "@/api/feeding";

type Props = { latest: LatestFeeding | null };

function formatSince(dateTime: string, userName: string) {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(dateTime).getTime()) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `Sami was last fed ${hours} hour${hours === 1 ? "" : "s"}, ${minutes} minute${minutes === 1 ? "" : "s"} ago by ${userName}`;
}

export default function LastFedBanner({ latest }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const text = useMemo(() => {
    if (!latest) return "No feedings logged yet.";
    return formatSince(latest.date_time, latest.user_name);
  }, [latest]);

  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
    color: "#0f172a",
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    overflow: "hidden",
  },
});
