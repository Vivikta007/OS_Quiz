import { View } from "react-native";

import { AppText } from "@/ui/AppText";
import { radius } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

type Tone = "accent" | "warning" | "danger" | "neutral";

// A small status tag, e.g. "Live", "Pending", "AI"
export function Badge({ label, tone = "accent" }: { label: string; tone?: Tone }) {
  const styles = useStyles();
  return (
    <View style={[styles.badge, styles[tone]]}>
      <AppText variant="caption" style={[styles.text, styles[`${tone}Text`]]}>
        {label}
      </AppText>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radius.sm - 2,
  },
  text: {
    fontSize: 11,
    lineHeight: 15,
  },
  accent: { backgroundColor: colors.accentSoft },
  accentText: { color: colors.accentText },
  warning: { backgroundColor: colors.warningSoft },
  warningText: { color: colors.warning },
  danger: { backgroundColor: colors.dangerSoft },
  dangerText: { color: colors.danger },
  neutral: { backgroundColor: colors.surfaceRaised },
  neutralText: { color: colors.textSecondary },
}));
