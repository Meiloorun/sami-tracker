import { getClientDeviceName } from "@/lib/device";
import { Platform } from "react-native";

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function identify(email: string) {
    const res = await fetch(`${BASE_URL}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            device_name: getClientDeviceName(),
            platform: Platform.OS,
        }),
    })

    if (!res.ok) {
        if (res.status === 403) throw new Error("Email not allowed");
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to identify user");
    }

    return res.json();
}
