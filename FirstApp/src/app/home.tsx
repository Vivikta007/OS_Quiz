import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { tapHaptic } from "@/ui/haptics";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing } from "@/ui/theme";

const START_SIZE = 190;

export default function HomeScreen() {
  const [userName, setUserName] = useState<string | null>(null);

  // Runs every time Home comes back into view, so a name changed on the
  // Profile screen shows up straight away.
  useFocusEffect(
    useCallback(() => {
      apiRequest("/me", { auth: true })
        .then((me) => setUserName(me.full_name ?? me.email))
        .catch(() => {});
    }, []),
  );

  const initial = userName ? userName.charAt(0).toUpperCase() : null;

  const open = (href: Href) => {
    tapHaptic();
    router.push(href);
  };

  return (
    <Screen>
      {/* TITLE + PROFILE BUTTON */}
      <View style={styles.topBar}>
        <AppText variant="title">OS Quiz App</AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={8}
          onPress={() => open("/profile")}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          {initial ? (
            <AppText variant="bodyStrong">{initial}</AppText>
          ) : (
            <Ionicons name="person-outline" size={18} color={colors.text} />
          )}
        </Pressable>
      </View>

      {/* START QUIZ (big round button in the middle) */}
      <View style={styles.center}>
        <View style={styles.startRing}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start quiz"
            onPress={() => open("/quizInit")}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
          >
            <Ionicons name="play" size={56} color="#FFFFFF" style={styles.playIcon} />
          </Pressable>
        </View>

        <AppText variant="heading" style={styles.startLabel}>
          Start Quiz
        </AppText>
        <AppText variant="small" tone="secondary">
          Choose topics and difficulty
        </AppText>

        {/* PERFORMANCE + HISTORY */}
        <View style={styles.shortcuts}>
          <Shortcut label="Performance" onPress={() => open("/performance")} />
          <Shortcut label="Quiz History" onPress={() => open("/history")} />
        </View>
      </View>
    </Screen>
  );
}

function Shortcut({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
    >
      <AppText style={styles.shortcutText}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  // A faint ring around the start button
  startRing: {
    width: START_SIZE + 28,
    height: START_SIZE + 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    width: START_SIZE,
    height: START_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  startButtonPressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.97 }],
  },
  playIcon: {
    marginLeft: 6, // the play triangle looks off-centre without this
  },
  startLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  shortcuts: {
    flexDirection: "row",
    gap: spacing.md,
    alignSelf: "stretch",
    marginTop: spacing.xxl + spacing.xl,
  },
  shortcut: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  shortcutPressed: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  shortcutText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
