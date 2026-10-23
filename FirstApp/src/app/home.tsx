import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Avatar, Brand, Bullet } from "@/ui/Brand";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { tapHaptic } from "@/ui/haptics";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { TabBar } from "@/ui/TabBar";
import { radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

type Me = { full_name: string | null; email: string; is_admin: boolean };

type Attempt = {
  id: number;
  score: number;
  total_questions: number;
  topics: string[];
  difficulty: string;
  created_at: string;
};

type TopicInfo = {
  topic: string;
  counts: { Easy: number; Medium: number; Hard: number };
  answered: number;
  accuracy: number | null;
  level: "new" | "learning" | "improving" | "strong";
};

const TOPICS_ON_HOME = 4;

// Days in a row (ending today or yesterday) with at least one quiz
function streakDays(attempts: Attempt[]) {
  const days = new Set(
    attempts.map((attempt) => new Date(attempt.created_at).toDateString()),
  );
  const day = new Date();
  if (!days.has(day.toDateString())) {
    day.setDate(day.getDate() - 1);
  }
  let streak = 0;
  while (days.has(day.toDateString())) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function topicSummary(info: TopicInfo) {
  if (info.accuracy === null) return "Not started yet";
  const levels = { new: "New", learning: "Learning", improving: "Improving", strong: "Strong" };
  return `${levels[info.level]} · ${info.accuracy}% correct`;
}

export default function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [topics, setTopics] = useState<TopicInfo[] | null>(null);
  const [opening, setOpening] = useState(false);

  // Reload every time Home comes back into view, so a finished quiz or a
  // renamed profile shows up straight away.
  useFocusEffect(
    useCallback(() => {
      apiRequest("/me", { auth: true }).then(setMe).catch(() => {});
      apiRequest("/quiz-attempts", { auth: true })
        .then(setAttempts)
        .catch(() => setAttempts([]));
      apiRequest("/topics", { auth: true })
        .then(setTopics)
        .catch(() => setTopics([]));
    }, []),
  );

  const name = me ? me.full_name || me.email : null;
  const firstName = name?.split(/[\s@]/)[0] ?? null;
  const last = attempts?.[0];
  const streak = attempts ? streakDays(attempts) : 0;

  const open = (href: Href) => {
    tapHaptic();
    router.push(href);
  };

  const openLastReview = async () => {
    if (!last || opening) return;
    setOpening(true);
    try {
      const attempt = await apiRequest(`/quiz-attempts/${last.id}`, { auth: true });
      router.push({
        pathname: "/review",
        params: { answers: JSON.stringify(attempt.answers) },
      });
    } catch {
      router.push("/history");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen scroll tabBar={<TabBar active="home" />}>
      <Reveal order={0} style={styles.topBar}>
        <Brand />
        <Avatar name={name} onPress={() => router.push("/profile")} />
      </Reveal>

      <Reveal order={1} style={styles.greeting}>
        <View style={styles.greetingRow}>
          <AppText variant="title">Hi, {firstName ?? "there"}.</AppText>
          {streak > 0 && (
            <View style={styles.streak}>
              <Ionicons name="flame-outline" size={13} color={colors.accentText} />
              <AppText variant="caption" tone="accent">
                {streak}-day streak
              </AppText>
            </View>
          )}
        </View>
      </Reveal>

      {/* HERO */}
      <Reveal order={2}>
        <Card tinted style={styles.hero}>
          <TerminalArt />
          <AppText variant="label" tone="accent">
            Practice lab
          </AppText>
          <AppText variant="title" style={styles.heroTitle}>
            Operating{"\n"}systems
          </AppText>
          <Button
            title="Start a new quiz"
            onPress={() => open("/quizInit")}
            style={styles.heroButton}
          />
        </Card>
      </Reveal>

      {/* LAST QUIZ */}
      {last && (
        <Reveal order={3}>
          <Card onPress={openLastReview} style={styles.resume}>
            <View style={styles.resumeText}>
              <AppText variant="label" tone="muted">
                Pick up where you left off
              </AppText>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {last.topics.length > 0 ? last.topics.join(", ") : "Last quiz"}
              </AppText>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${last.total_questions ? (last.score / last.total_questions) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" tone="muted">
                {last.score} of {last.total_questions} correct · review answers
              </AppText>
            </View>
            <View style={styles.roundArrow}>
              {opening ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="arrow-forward" size={18} color={colors.accentText} />
              )}
            </View>
          </Card>
        </Reveal>
      )}

      {/* ADMIN WORKSPACE */}
      {me?.is_admin && (
        <Reveal order={4}>
          <Card onPress={() => router.push("/admin")} style={styles.row}>
            <Bullet />
            <View style={styles.rowText}>
              <AppText variant="bodyStrong">Teaching workspace</AppText>
              <AppText variant="caption" tone="muted">
                Write, review and publish questions
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        </Reveal>
      )}

      {/* TOPICS */}
      <Reveal order={5} style={styles.sectionHeader}>
        <AppText variant="heading">Explore OS topics</AppText>
        {topics && topics.length > TOPICS_ON_HOME && (
          <Pressable hitSlop={10} onPress={() => open("/quizInit")}>
            <AppText variant="caption" tone="accent">
              See all
            </AppText>
          </Pressable>
        )}
      </Reveal>

      {topics === null ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : topics.length === 0 ? (
        <AppText variant="small" tone="muted">
          No topics yet. Check back once questions are published.
        </AppText>
      ) : (
        <Reveal order={6}>
          <View style={styles.list}>
            {topics.slice(0, TOPICS_ON_HOME).map((info, index) => {
              return (
                <Pressable
                  key={info.topic}
                  accessibilityRole="button"
                  accessibilityLabel={info.topic}
                  onPress={() =>
                    open({ pathname: "/quizInit", params: { topic: info.topic } })
                  }
                  style={({ pressed }) => [
                    styles.topicRow,
                    index > 0 && styles.divider,
                    pressed && styles.pressed,
                  ]}
                >
                  <Bullet />
                  <View style={styles.rowText}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {info.topic}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {topicSummary(info)}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        </Reveal>
      )}
    </Screen>
  );
}

// A small terminal window drawn in the hero's corner
function TerminalArt() {
  const styles = useStyles();
  return (
    <View style={styles.art} pointerEvents="none">
      <View style={styles.artCircle} />
      <View style={styles.window}>
        <View style={styles.windowBar}>
          <View style={styles.windowDot} />
          <View style={styles.windowDot} />
          <View style={styles.windowDot} />
        </View>
        <View style={styles.windowBody}>
          <AppText variant="bodyStrong" style={styles.prompt}>
            {">_"}
          </AppText>
          <View style={styles.lines}>
            <View style={[styles.line, { width: 34 }]} />
            <View style={[styles.line, { width: 24 }]} />
            <View style={[styles.line, { width: 30 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  greeting: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  hero: {
    marginTop: spacing.lg,
    padding: spacing.lg + 2,
    overflow: "hidden",
  },
  heroTitle: {
    marginTop: spacing.xs,
  },
  heroButton: {
    marginTop: spacing.lg,
  },
  art: {
    position: "absolute",
    top: 8,
    right: -14,
    width: 160,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  artCircle: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    opacity: 0.55,
  },
  window: {
    width: 104,
    height: 70,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    opacity: 0.8,
    overflow: "hidden",
  },
  windowBar: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.accent,
  },
  windowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  windowBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  prompt: {
    color: colors.accentText,
    fontSize: 17,
  },
  lines: {
    gap: 5,
    alignItems: "flex-end",
  },
  line: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
  resume: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  resumeText: {
    flex: 1,
    gap: 6,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
    maxWidth: 200,
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  roundArrow: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  loading: {
    marginVertical: spacing.xl,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
}));
