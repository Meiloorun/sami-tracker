import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_KEY = "sami_session_v1";
const CLIENT_INSTANCE_ID_KEY = "sami_client_instance_id";

function generateClientInstanceId() {
    const random = Math.random().toString(36).slice(2, 10);
    const random2 = Math.random().toString(36).slice(2, 10);
    const ts = Date.now().toString(36);
    return `ci_${ts}_${random}_${random2}`;
}

export type Session = {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
}

export async function getSession(): Promise<Session | null> {
    const raw = Platform.OS === "web"
        ? localStorage.getItem(SESSION_KEY)
        : await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

export async function setSession(session: Session) {
    const value = JSON.stringify(session);
    if (Platform.OS === "web") {
        localStorage.setItem(SESSION_KEY, value);
        return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function clearSession() {
    if (Platform.OS === "web") {
        localStorage.removeItem(SESSION_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function getClientInstanceId(): Promise<string> {
    if (Platform.OS === "web") {
        let id = localStorage.getItem(CLIENT_INSTANCE_ID_KEY);
        if (!id) {
            id = generateClientInstanceId();
            localStorage.setItem(CLIENT_INSTANCE_ID_KEY, id);
        }
        return id;
    }

    let id = await SecureStore.getItemAsync(CLIENT_INSTANCE_ID_KEY);
    if (!id) {
        id = generateClientInstanceId();
        await SecureStore.setItemAsync(CLIENT_INSTANCE_ID_KEY, id);
    }
    return id;
}
