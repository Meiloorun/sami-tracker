import { getSession } from '@/lib/session';
import { apiFetch } from "@/lib/api";

export type FeedingRecord = {
  id: number;
  date_time: string;
  feed_description: string;
  notes: string | null;
  user_id: number;
  user_name?: string;
};

export type FeedingDisplay = FeedingRecord & { user_name: string };

export async function addFeeding(feed_description: string, date_time: Date, notes?: string): Promise<FeedingRecord> {
  const session = await getSession();
  if (!session) {
    throw new Error("You need to be logged in to add a feeding");
  }
  const res = await apiFetch("/feedings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date_time: date_time.toISOString(),
      feed_description: feed_description,
      notes: notes || "",
      user_id: session.user.id,
    }),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || "Failed to add Sami feeding");
  }

  return res.json();
}

export async function getFeedings(): Promise<FeedingRecord[]> {
  const res = await apiFetch("/feedings", undefined, { allowNetworkFallback: true });
  if (!res.ok) throw new Error("Failed to load feedings");
  return res.json();
}

export async function getLatestFeeding(): Promise<FeedingDisplay | null> {
  const res = await apiFetch("/feedings/latest", undefined, { allowNetworkFallback: true });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load latest feeding");
  return res.json();
}

export async function getRecentFeedings(limit = 3): Promise<FeedingDisplay[]> {
  const res = await apiFetch(`/feedings/recent?limit=${limit}`, undefined, { allowNetworkFallback: true });
  if (!res.ok) throw new Error("Failed to load recent feedings");
  return res.json();
}

export async function getFeedingsByDay(date: string): Promise<FeedingDisplay[]> {
  const tzOffsetMinutes = new Date().getTimezoneOffset();
  const res = await apiFetch(
    `/feedings/day?date=${encodeURIComponent(date)}&tzOffsetMinutes=${tzOffsetMinutes}`,
    undefined,
    { allowNetworkFallback: true },
  );
  if (!res.ok) throw new Error("Failed to load day feedings");
  return res.json();
}

export async function deleteFeeding(feedingId: number): Promise<FeedingRecord> {
  const res = await apiFetch(`/feedings/${feedingId}`, { method: "DELETE" });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || "Failed to delete feeding");
  }
  return res.json();
}
