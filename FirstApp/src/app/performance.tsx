import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Bullet } from "@/ui/Brand";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { tapHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { TabBar } from "@/ui/TabBar";
import { type Palette, radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Progress report. All numbers are calculated by the backend
// (GET /performance) from this user's saved quiz attempts. Only
// percentages are shown - never how many questions there are.

type RecentAttempt = {
  id: number;
  created_at: string;
  difficulty: string;
  percent: number;
};

type BreakdownRow = {
  name: string;
  total: number;
  accuracy: number;
};

type TopicRow = BreakdownRow & {
  difficulties: BreakdownRow[];
};

type Performance = {
  total_attempts: number;
  accuracy: number;
  best_score: number;
  recent: RecentAttempt[]; // oldest first
  topics: TopicRow[]; // best first
  difficulties: BreakdownRow[];
  weakest_topic: string | null;
  strongest_topic: string | null;
};

const RECENT_SHOWN = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Teal when it's going well, amber when it needs work
function barColor(colors: Palette, percent: number) {
  return percent >= 50 ? colors.accent : colors.warning;
}

export default function PerformanceScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPerformance = () =>
    apiRequest("/performance", { auth: true })
      .then((performance: Performance) => {
        setData(performance);
        setError(null);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your progress.",
        );
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });

  useEffect(() => {
    loadPerformance();
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    loadPerformance();
  };

  // Open a past quiz in the Review screen
  const openAttempt = async (attemptId: number) => {
    tapHaptic();
    setOpeningId(attemptId);

    try {
      const attempt = await apiRequest(`/quiz-attempts/${attemptId}`, {
        auth: true,
      });
      router.push({
        pathname: "/review",
        params: { answers: JSON.stringify(attempt.answers) },
      });
    } catch {
      // The list stays usable; the user can tap again
    } finally {
      setOpeningId(null);
    }
  };

  const practise = (topic: string) => {
    tapHaptic();
    router.push({ pathname: "/quizInit", params: { topic } });
  };

  const header = <Header title="Progress" hideBack />;
  const tabBar = <TabBar active="performance" />;

  if (loading) {
    return (
      <Screen header={header} tabBar={tabBar}>
        <StateView loading />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen header={header} tabBar={tabBar}>
        <StateView tone="danger" title="Couldn't load your progress" message={error}>
          <Button title="Try again" variant="secondary" onPress={retry} />
        </StateView>
      </Screen>
    );
  }

  if (data.total_attempts === 0) {
    return (
      <Screen header={header} tabBar={tabBar}>
        <StateView
          title="No results yet"
          message="Finish a quiz and your accuracy and strongest topics will appear here."
        >
          <Button title="Start a quiz" onPress={() => router.push("/quizInit")} />
        </StateView>
      </Screen>
    );
  }

  const recent = [...data.recent].reverse().slice(0, RECENT_SHOWN);
  const showFocus =
    data.strongest_topic &&
    data.weakest_topic &&
    data.strongest_topic !== data.weakest_topic;

  return (
    <Screen
      scroll
      header={header}
      tabBar={tabBar}
      onRefresh={() => {
        setRefreshing(true);
        loadPerformance();
      }}
      refreshing={refreshing}
    >
      {error && (
        <AppText variant="small" tone="danger" center style={styles.error}>
          {error}
        </AppText>
      )}

      {/* OVERVIEW */}
      <Reveal order={0}>
        <Card tinted style={styles.overview}>
          <AppText variant="label" tone="accent">
            Overall accuracy
          </AppText>
          <AppText variant="display">{data.accuracy}%</AppText>
          <Bar percent={data.accuracy} />
          <View style={styles.overviewStats}>
            <View style={styles.flex}>
              <AppText variant="heading">{data.total_attempts}</AppText>
              <AppText variant="caption" tone="secondary">
                {data.total_attempts === 1 ? "Quiz taken" : "Quizzes taken"}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="heading">{data.best_score}%</AppText>
              <AppText variant="caption" tone="secondary">
                Best score
              </AppText>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* STRONGEST / WEAKEST */}
      {showFocus && (
        <Reveal order={1}>
          <Card style={styles.focus}>
            <View style={styles.focusRow}>
              <Bullet />
              <View style={styles.flex}>
                <AppText variant="caption" tone="muted">
                  Strongest topic
                </AppText>
                <AppText variant="bodyStrong">{data.strongest_topic}</AppText>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.focusRow}>
              <Bullet style={{ backgroundColor: colors.warning }} />
              <View style={styles.flex}>
                <AppText variant="caption" tone="muted">
                  Needs practice
                </AppText>
                <AppText variant="bodyStrong">{data.weakest_topic}</AppText>
              </View>
              <Button
                title="Practice"
                size="sm"
                variant="secondary"
                onPress={() => practise(data.weakest_topic!)}
              />
            </View>
          </Card>
        </Reveal>
      )}

      {/* BY DIFFICULTY */}
      {data.difficulties.length > 0 && (
        <Reveal order={2}>
          <AppText variant="heading" style={styles.sectionTitle}>
            By difficulty
          </AppText>
          <View style={styles.levels}>
            {data.difficulties.map((level) => (
              <Card key={level.name} style={styles.level}>
                <AppText variant="caption" tone="secondary">
                  {level.name}
                </AppText>
                <AppText variant="heading">
                  {level.total > 0 ? `${level.accuracy}%` : "-"}
                </AppText>
                <Bar percent={level.total > 0 ? level.accuracy : 0} />
              </Card>
            ))}
          </View>
        </Reveal>
      )}

      {/* TOPICS */}
      {data.topics.length > 0 && (
        <Reveal order={3}>
          <AppText variant="heading" style={styles.sectionTitle}>
            Topics
          </AppText>
          <View style={styles.group}>
            {data.topics.map((topic, index) => {
              const open = openTopic === topic.name;
              return (
                <View key={topic.name} style={index > 0 && styles.rowDivider}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    onPress={() => {
                      tapHaptic();
                      setOpenTopic(open ? null : topic.name);
                    }}
                    style={({ pressed }) => [styles.topicRow, pressed && styles.pressed]}
                  >
                    <View style={styles.topicTop}>
                      <Bullet />
                      <AppText variant="bodyStrong" style={styles.flex} numberOfLines={1}>
                        {topic.name}
                      </AppText>
                      <AppText variant="bodyStrong">{topic.accuracy}%</AppText>
                      <Ionicons
                        name={open ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.textMuted}
                      />
                    </View>
                    <Bar percent={topic.accuracy} />
                  </Pressable>

                  {open && (
                    <View style={styles.topicDetails}>
                      <View style={styles.splits}>
                        {topic.difficulties.map((level) => (
                          <View key={level.name} style={styles.split}>
                            <AppText variant="caption" tone="muted">
                              {level.name}
                            </AppText>
                            <AppText variant="bodyStrong">
                              {level.total > 0 ? `${level.accuracy}%` : "-"}
                            </AppText>
                          </View>
                        ))}
                      </View>
                      <Button
                        title="Practise this topic"
                        size="sm"
                        variant="secondary"
                        onPress={() => practise(topic.name)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Reveal>
      )}

      {/* RECENT QUIZZES */}
      <Reveal order={4}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Recent quizzes</AppText>
          {data.recent.length > RECENT_SHOWN && (
            <Pressable hitSlop={10} onPress={() => router.replace("/history")}>
              <AppText variant="caption" tone="accent">
                See all
              </AppText>
            </Pressable>
          )}
        </View>
        <View style={styles.group}>
          {recent.map((attempt, index) => (
            <Pressable
              key={attempt.id}
              accessibilityRole="button"
              accessibilityLabel={`${attempt.percent} percent, ${attempt.difficulty}. Open review`}
              onPress={() => openAttempt(attempt.id)}
              disabled={openingId !== null}
              style={({ pressed }) => [
                styles.recentRow,
                index > 0 && styles.rowDivider,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.flex}>
                <AppText variant="body">{formatDate(attempt.created_at)}</AppText>
                <AppText variant="caption" tone="muted">
                  {attempt.difficulty}
                </AppText>
              </View>
              {openingId === attempt.id ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <>
                  <AppText
                    variant="bodyStrong"
                    style={{ color: barColor(colors, attempt.percent) }}
                  >
                    {attempt.percent}%
                  </AppText>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </>
              )}
            </Pressable>
          ))}
        </View>
      </Reveal>
    </Screen>
  );
}

// A thin progress bar
function Bar({ percent }: { percent: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${percent}%`, backgroundColor: barColor(colors, percent) },
        ]}
      />
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  flex: {
    flex: 1,
  },
  error: {
    marginBottom: spacing.md,
  },
  overview: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    padding: spacing.lg + 2,
  },
  overviewStats: {
    flexDirection: "row",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  focus: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  focusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  levels: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  level: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
  topicRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  topicTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  topicDetails: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  splits: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  split: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
}));
