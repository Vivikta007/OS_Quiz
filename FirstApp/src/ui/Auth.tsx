import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { colors, layout, spacing } from "@/ui/theme";

// Shared pieces of the logged-out screens (login, register, forgot password)

// App logo, name and a one-line subtitle
export function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/images/splash-icon.png")}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <AppText variant="title" center>
        OS Quiz
      </AppText>
      <AppText variant="small" tone="secondary" center>
        {subtitle}
      </AppText>
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

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 88,
    height: 88,
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
    fontWeight: "700",
  },
});
