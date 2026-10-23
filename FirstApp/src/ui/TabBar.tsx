import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/ui/AppText";
import { selectHaptic } from "@/ui/haptics";
import { fonts, radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type Tab = "home" | "history" | "performance" | "profile";

const TABS: { name: Tab; label: string; icon: IconName; activeIcon: IconName }[] = [
  { name: "home", label: "Learn", icon: "home-outline", activeIcon: "home" },
  { name: "history", label: "My quizzes", icon: "layers-outline", activeIcon: "layers" },
  {
    name: "performance",
    label: "Progress",
    icon: "stats-chart-outline",
    activeIcon: "stats-chart",
  },
  { name: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

// Switch tabs while keeping the stack short: Home stays at the bottom and
// at most one other tab sits on top of it, so Back always returns Home.
function openTab(from: Tab, to: Tab) {
  if (to === from) return;
  if (to === "home") {
    router.dismissTo("/home");
  } else if (from === "home") {
    router.push(`/${to}`);
  } else {
    router.replace(`/${to}`);
  }
}

// The bottom navigation on the four main screens
export function TabBar({ active }: { active: Tab }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => {
        const selected = tab.name === active;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => {
              selectHaptic();
              openTab(active, tab.name);
            }}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapActive]}>
              <Ionicons
                name={selected ? tab.activeIcon : tab.icon}
                size={19}
                color={selected ? colors.accentText : colors.textMuted}
              />
            </View>
            <AppText
              variant="caption"
              style={[styles.label, selected && styles.labelActive]}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  bar: {
    flexDirection: "row",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  iconWrap: {
    width: 46,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accentText,
    fontFamily: fonts.bodySemiBold,
  },
}));
