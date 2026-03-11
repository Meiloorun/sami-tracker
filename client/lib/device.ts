// client/lib/device-name.ts
import { Platform } from "react-native";
import * as Device from "expo-device";

export function getClientDeviceName(): string {
  if (Platform.OS === "web") {
    const platform = typeof navigator !== "undefined" ? navigator.platform : "Web";
    const mobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    return `${platform} ${mobile ? "Mobile Browser" : "Browser"}`;
  }

  return Device.deviceName || Device.modelName || "Unknown device";
}
