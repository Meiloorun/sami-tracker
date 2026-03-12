import { Image } from "expo-image";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";

type AvatarShape = "circle" | "square" | "rounded" | "hero";

type SamiAvatarProps = {
  shape?: AvatarShape;
  size?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  showRing?: boolean;
  ringWidth?: number;
  ringColour?: string;
  source?: number | { uri: string };
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  backgroundColour?: string;
};

export default function SamiAvatar({
  shape = "circle",
  size = 64,
  width,
  height,
  radius,
  showRing = true,
  ringWidth = 2,
  ringColour = "#4ade80",
  source = require("../../assets/images/sami-avatar.png"),
  style,
  accessibilityLabel = "SAMI",
  backgroundColour = "transparent",
}: SamiAvatarProps) {
  const resolvedWidth = shape === "hero" ? (width ?? "100%") : (width ?? size);
  const resolvedHeight = shape === "hero" ? (height ?? 180) : (height ?? size);

  const resolvedRadius =
    radius ??
    (shape === "circle"
      ? size / 2
      : shape === "rounded"
        ? 16
        : shape === "hero"
          ? 20
          : 0);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          borderWidth: showRing ? ringWidth : 0,
          borderColor: ringColour,
          backgroundColor: backgroundColour,
        },
        style,
      ]}
    >
      <Image
        source={source}
        contentFit="cover"
        style={{ width: "100%", height: "100%", borderRadius: resolvedRadius }}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});
