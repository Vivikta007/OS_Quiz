import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { tapHaptic } from "@/ui/haptics";
import { colors, layout, radius, spacing } from "@/ui/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  title?: string;
  // What the left button does. Defaults to going back.
  onBack?: () => void;
  backIcon?: IconName; // e.g. "close" for leaving a quiz
  hideBack?: boolean;
  right?: ReactNode;
};

// Top bar: back arrow on the left, title in the middle, optional action right.
export function Header({
  title,
  onBack,
  backIcon = "chevron-back",
  hideBack,
  right,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {!hideBack && (
          <IconButton
            icon={backIcon}
            label="Back"
            onPress={onBack ?? (() => goBack())}
          />
        )}
      </View>

      <AppText variant="heading" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>

      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

// A round icon-only button (back, close, menu...)
export function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={layout.hitSlop}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.iconButtonPressed,
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
  },
  side: {
    width: 56,
    flexDirection: "row",
  },
  right: {
    justifyContent: "flex-end",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
});
