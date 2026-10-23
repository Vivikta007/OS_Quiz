import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  type ViewStyle,
} from "react-native";

import { tapHaptic } from "@/ui/haptics";
import { colors, fonts, layout, radius, spacing } from "@/ui/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Look = {
  background: string;
  pressed: string;
  border: string;
  text: string;
};

const looks: Record<Variant, Look> = {
  primary: {
    background: colors.accent,
    pressed: colors.accentPressed,
    border: colors.accent,
    text: colors.onAccent,
  },
  secondary: {
    background: colors.surface,
    pressed: colors.surfaceRaised,
    border: colors.border,
    text: colors.text,
  },
  ghost: {
    background: "transparent",
    pressed: colors.surfaceRaised,
    border: "transparent",
    text: colors.accentText,
  },
  danger: {
    background: colors.dangerSoft,
    pressed: colors.dangerPressed,
    border: colors.dangerSoft,
    text: colors.danger,
  },
};

// One plain text button for the whole app, with a light vibration on
// every tap.
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const look = looks[variant];
  const inactive = disabled || loading;
  const small = size === "sm";

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
          height: small ? layout.buttonHeightSmall : layout.buttonHeight,
          paddingHorizontal: small ? spacing.md : spacing.lg + 2,
          backgroundColor: pressed ? look.pressed : look.background,
          borderColor: look.border,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.text} />
      ) : (
        <Text
          style={[styles.title, { color: look.text, fontSize: small ? 13.5 : 15 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bodySemiBold,
  },
});
