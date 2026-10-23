import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";

import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { tapHaptic } from "@/ui/haptics";
import { layout, radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  title?: string;
  // What the left button does. Defaults to going back.
  onBack?: () => void;
  backIcon?: IconName; // e.g. "close" for leaving a quiz
  hideBack?: boolean;
  right?: ReactNode;
};

// Top bar: back arrow, then the title set left (not centred), and an
// optional action on the right.
export function Header({
  title,
  onBack,
  backIcon = "chevron-back",
  hideBack,
  right,
}: Props) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      {!hideBack && (
        <IconButton
          icon={backIcon}
          label="Back"
          onPress={onBack ?? (() => goBack())}
        />
      )}

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
  const styles = useStyles();
  const { colors } = useTheme();
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
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

const useStyles = createStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    height: 60,
  },
  side: {
    flexDirection: "row",
  },
  right: {
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
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
}));
