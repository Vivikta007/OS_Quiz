import type { ReactNode } from "react";
import {
  Pressable,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import { tapHaptic } from "@/ui/haptics";
import { radius, spacing } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

type Props = {
  children: ReactNode;
  onPress?: () => void; // makes the whole card tappable
  selected?: boolean; // teal border, e.g. a chosen answer
  tinted?: boolean; // soft teal panel instead of white
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

// A white panel with a hairline border. Pass onPress to make it a
// tappable row or tile.
export function Card({
  children,
  onPress,
  selected,
  tinted,
  style,
  accessibilityLabel,
}: Props) {
  const styles = useStyles();
  if (!onPress) {
    return (
      <View
        style={[
          styles.card,
          tinted && styles.tinted,
          selected && styles.selected,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        tinted && styles.tinted,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  tinted: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
}));
