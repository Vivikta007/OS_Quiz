import type { ReactNode } from "react";
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { tapHaptic } from "@/ui/haptics";
import { colors, radius, spacing } from "@/ui/theme";

type Props = {
  children: ReactNode;
  onPress?: () => void; // makes the whole card tappable
  selected?: boolean; // accent border, e.g. a chosen answer
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

// A rounded panel. Pass onPress to make it a big tappable row/tile.
export function Card({
  children,
  onPress,
  selected,
  style,
  accessibilityLabel,
}: Props) {
  if (!onPress) {
    return (
      <View style={[styles.card, selected && styles.selected, style]}>
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
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
    transform: [{ scale: 0.985 }],
  },
});
