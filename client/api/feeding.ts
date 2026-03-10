const BASE_URL = "http://localhost:3000";
import { getSession } from '@/lib/session';

export async function addFeeding(feed_description: string, date_time: Date, notes?: string) {
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

export async function getFeedings() {
  const res = await fetch(`${BASE_URL}/feedings`);
  return res.json();
}

export async function getLatestFeeding() {
  const res = await fetch(`${BASE_URL}/feedings/latest`);
  return res.json();
}
