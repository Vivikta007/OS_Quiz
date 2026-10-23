import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { AppText } from "@/ui/AppText";
import { tapHaptic } from "@/ui/haptics";
import { layout, radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// The app mark: a teal tile with a small monitor, then the name.
// `badge` adds a small tag after the name, e.g. "Admin".
export function Brand({ badge }: { badge?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.brand}>
      <View style={styles.mark}>
        <Ionicons name="desktop-outline" size={17} color={colors.onAccent} />
      </View>
      <AppText variant="heading" style={styles.name}>
        OS Quiz
      </AppText>
      {badge && (
        <View style={styles.badge}>
          <AppText variant="label" tone="accent" style={styles.badgeText}>
            {badge}
          </AppText>
        </View>
      )}
    </View>
  );
}

// The round initials button at the top right of the main screens
export function Avatar({
  name,
  onPress,
  label = "Profile",
}: {
  name: string | null;
  onPress: () => void;
  label?: string;
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
      style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
    >
      {name ? (
        <AppText variant="caption" style={styles.initials}>
          {initials(name)}
        </AppText>
      ) : (
        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

// "Jamie Doe" -> "JD", "alex@uni.edu" -> "A"
export function initials(name: string) {
  const parts = name.split("@")[0].trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// A small green dot at the start of list rows
export function Bullet({ style }: { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.bullet, style]} />;
}

const useStyles = createStyles((colors) => ({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 19,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  badgeText: {
    fontSize: 9,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressed: {
    backgroundColor: colors.border,
  },
  initials: {
    color: colors.textSecondary,
    fontSize: 11.5,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
}));
