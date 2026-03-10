import { getSession } from '@/lib/session';
const BASE_URL = "http://localhost:3000";

export type FeedingRecord = {
  id: number;
  date_time: string;
  feed_description: string;
  notes: string | null;
  user_id: number;
  user_name?: string;
};

export type LatestFeeding = FeedingRecord & { user_name: string };

export async function addFeeding(feed_description: string, date_time: Date, notes?: string): Promise<FeedingRecord> {
  const session = await getSession();
  if (!session) {
    throw new Error("You need to be logged in to add a feeding");
  }
  const res = await fetch(`${BASE_URL}/feedings`, {
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
  const res = await fetch(`${BASE_URL}/feedings`);
  if (!res.ok) throw new Error("Failed to load feedings");
  return res.json();
}

export async function getLatestFeeding(): Promise<LatestFeeding | null> {
  const res = await fetch(`${BASE_URL}/feedings/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load latest feeding");
  return res.json();
}

export async function getRecentFeedings(limit = 3): Promise<LatestFeeding[]> {
  const res = await fetch(`${BASE_URL}/feedings/recent?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to load recent feedings");
  return res.json();
}

export async function deleteFeeding(feedingId: number): Promise<FeedingRecord> {
  const res = await fetch(`${BASE_URL}/feedings/${feedingId}`, { method: "DELETE" });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || "Failed to delete feeding");
  }
  return res.json();
}
