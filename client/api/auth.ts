import { getClientDeviceName } from "@/lib/device";
import { apiFetch } from "@/lib/api";
import { getClientInstanceId } from "@/lib/session";
import { Platform } from "react-native";

export async function identify(email: string) {
    const res = await apiFetch("/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            device_name: getClientDeviceName(),
            platform: Platform.OS,
            client_instance_id: await getClientInstanceId(),
        }),
    }, { allowNetworkFallback: true });

    if (!res.ok) {
        if (res.status === 403) throw new Error("Email not allowed");
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to identify user");
    }

    return res.json();
}
