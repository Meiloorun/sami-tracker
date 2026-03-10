import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { LatestFeeding } from "@/api/feeding";

type Props = { latest: LatestFeeding | null };

function formatSince(dateTime: string, userName: string, nowMs: number) {
  const fedMs = new Date(dateTime).getTime();
  if (Number.isNaN(fedMs)) {
    return "Sami was last fed recently.";
  }

  const signedDiff = Math.floor((nowMs - fedMs) / 1000);
  const diff = Math.abs(signedDiff);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  const suffix = signedDiff >= 0 ? "ago" : "from now";
  return `Sami was last fed ${hours} hour${hours === 1 ? "" : "s"}, ${minutes} minute${minutes === 1 ? "" : "s"}, ${seconds} second${seconds === 1 ? "" : "s"} ${suffix} by ${userName}`;
}

export default function LastFedBanner({ latest }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const text = latest
    ? formatSince(latest.date_time, latest.user_name, nowMs)
    : "No feedings logged yet.";

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
