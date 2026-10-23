import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Reveal } from "@/ui/Reveal";
import { spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

type Props = {
  loading?: boolean; // just a spinner (and the message, if given)
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
  tone = "default",
  title,
  message,
  children,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Reveal style={styles.state}>
      {loading && <ActivityIndicator size="large" color={colors.accent} />}
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
    </Reveal>
  );
}

const useStyles = createStyles((colors) => ({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  message: {
    maxWidth: 320,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
}));
