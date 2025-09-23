const BASE_URL = "http://192.168.1.67/3000";

export async function addFeeding(notes?: string) {
  const res = await fetch(`${BASE_URL}/feedings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date_time: new Date().toISOString(),
      notes: notes || "",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add Sami feeding");
  }

  return res.json();
}

export async function getFeedings() {
  const res = await fetch(`${BASE_URL}/feedings`);
  return res.json();
}
