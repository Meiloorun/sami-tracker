const BASE_URL = "http://localhost:3000";

export async function identify(email: string) {
    const res = await fetch(`${BASE_URL}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })

    if (!res.ok) {
        if (res.status === 403) throw new Error("Email not allowed");
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to identify user");
    }

    return res.json();
}