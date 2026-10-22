import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { colors, typography } from "@/ui/theme";

type Variant = keyof typeof typography;
type Tone = "default" | "secondary" | "muted" | "accent" | "success" | "danger";

const toneColors: Record<Tone, string> = {
  default: colors.text,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.accentText,
  success: colors.success,
  danger: colors.danger,
};

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
};

// <AppText variant="title">Hello</AppText> - text with the app's type scale
export function AppText({
  variant = "body",
  tone = "default",
  center,
  style,
  ...rest
}: Props) {
  return (
    <Text
      style={[
        typography[variant] as TextStyle,
        { color: toneColors[tone] },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
  },
});
