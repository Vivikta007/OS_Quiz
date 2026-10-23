import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { type Palette, typography } from "@/ui/theme";
import { useTheme } from "@/ui/ThemeProvider";

type Variant = keyof typeof typography;
type Tone = "default" | "secondary" | "muted" | "accent" | "success" | "danger";

function toneColor(colors: Palette, tone: Tone) {
  switch (tone) {
    case "secondary":
      return colors.textSecondary;
    case "muted":
      return colors.textMuted;
    case "accent":
      return colors.accentText;
    case "success":
      return colors.success;
    case "danger":
      return colors.danger;
    default:
      return colors.text;
  }
}

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
  const { colors } = useTheme();

  return (
    <Text
      style={[
        typography[variant] as TextStyle,
        { color: toneColor(colors, tone) },
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
