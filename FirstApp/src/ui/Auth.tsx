import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Reveal } from "@/ui/Reveal";
import { fonts, layout, spacing } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

// Shared pieces of the logged-out screens (login, register, forgot password)

// App logo, name and an optional line of instructions
export function AuthHeader({ subtitle }: { subtitle?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <Reveal order={0}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
          accessibilityIgnoresInvertColors
        />
      </Reveal>
      <Reveal order={1}>
        <AppText variant="title" center>
          OS Quiz
        </AppText>
      </Reveal>
      {subtitle && (
        <Reveal order={2}>
          <AppText variant="small" tone="secondary" center>
            {subtitle}
          </AppText>
        </Reveal>
      )}
    </View>
  );
}

// "Don't have an account? Register"
export function LinkRow({
  text,
  link,
  onPress,
  disabled,
}: {
  text: string;
  link: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.linkRow}>
      <AppText variant="small" tone="secondary">
        {text}{" "}
      </AppText>
      <Pressable
        accessibilityRole="link"
        hitSlop={layout.hitSlop}
        onPress={onPress}
        disabled={disabled}
      >
        <AppText variant="small" style={styles.link}>
          {link}
        </AppText>
      </Pressable>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  header: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 68,
    height: 68,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: spacing.lg,
  },
  link: {
    color: colors.accentText,
    fontFamily: fonts.bodyBold,
  },
}));
