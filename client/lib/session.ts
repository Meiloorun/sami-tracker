import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_KEY = "sami_session_v1";

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
