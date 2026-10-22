import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { colors, radius, spacing } from "@/ui/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  loading?: boolean; // just a spinner (and the message, if given)
  icon?: IconName;
  tone?: "default" | "danger";
  title?: string;
  message?: string | null;
  children?: ReactNode; // buttons, e.g. "Try again"
};

// The centred message a screen shows instead of its content: loading,
// an error, or "nothing here yet". Every screen uses this one so they
// all look the same.
export function StateView({
  loading,
  icon,
  tone = "default",
  title,
  message,
  children,
}: Props) {
  return (
    <View style={styles.state}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} />
      ) : (
        icon && (
          <View style={[styles.iconCircle, tone === "danger" && styles.dangerCircle]}>
            <Ionicons
              name={icon}
              size={30}
              color={tone === "danger" ? colors.danger : colors.accentText}
            />
          </View>
        )
      )}
      {title && (
        <AppText variant="heading" center>
          {title}
        </AppText>
      )}
      {message && (
        <AppText variant="small" tone="secondary" center style={styles.message}>
          {message}
        </AppText>
      )}
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.xs,
  },
  dangerCircle: {
    backgroundColor: colors.dangerSoft,
  },
  message: {
    maxWidth: 320,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
