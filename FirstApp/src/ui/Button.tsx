import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { tapHaptic } from "@/ui/haptics";
import { colors, layout, radius, spacing } from "@/ui/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: "md" | "sm";
  icon?: IconName; // shown before the title
  trailingIcon?: IconName; // shown after the title
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<
  Variant,
  { background: string; pressed: string; border: string; text: string }
> = {
  primary: {
    background: colors.accent,
    pressed: colors.accentPressed,
    border: colors.accent,
    text: "#FFFFFF",
  },
  secondary: {
    background: colors.surface,
    pressed: colors.surfaceRaised,
    border: colors.border,
    text: colors.text,
  },
  ghost: {
    background: "transparent",
    pressed: colors.surface,
    border: "transparent",
    text: colors.textSecondary,
  },
  danger: {
    background: colors.dangerSoft,
    pressed: "rgba(248, 113, 113, 0.2)",
    border: "rgba(248, 113, 113, 0.35)",
    text: colors.danger,
  },
};

// One button for the whole app. Pressing it shrinks it slightly, darkens it
// and gives a light vibration, so every tap feels the same.
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const look = variantStyles[variant];
  const inactive = disabled || loading;
  const iconSize = size === "sm" ? 17 : 19;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          height: size === "sm" ? layout.buttonHeightSmall : layout.buttonHeight,
          backgroundColor: pressed ? look.pressed : look.background,
          borderColor: look.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.text} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={iconSize} color={look.text} />}
          <Text
            style={[
              styles.title,
              { color: look.text, fontSize: size === "sm" ? 14 : 16 },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {trailingIcon && (
            <Ionicons name={trailingIcon} size={iconSize} color={look.text} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontWeight: "600",
  },
});
