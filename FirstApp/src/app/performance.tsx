import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { tapHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { colors, radius, spacing } from "@/ui/theme";

// Performance report. All numbers are calculated by the backend
// (GET /performance) from this user's saved quiz attempts.

type RecentAttempt = {
  id: number;
  created_at: string;
  score: number;
  total_questions: number;
  difficulty: string;
  percent: number;
};

type BreakdownRow = {
  name: string;
  correct: number;
  total: number;
  accuracy: number;
};

// One quiz's result for a single topic (only that topic's questions)
type TopicQuiz = {
  id: number;
  created_at: string;
  difficulty: string;
  correct: number;
  total: number;
  percent: number;
};

type TopicRow = BreakdownRow & {
  difficulties: BreakdownRow[];
  quizzes: TopicQuiz[];
};

type Performance = {
  total_attempts: number;
  total_questions: number;
  total_correct: number;
  accuracy: number;
  best_score: number;
  recent: RecentAttempt[];
  topics: TopicRow[];
  difficulties: BreakdownRow[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PerformanceScreen() {
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Each list can be collapsed to its heading
  const [showRecent, setShowRecent] = useState(true);
  const [showTopics, setShowTopics] = useState(true);

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
            : "Could not load your performance.",
        );
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });

  const refresh = () => {
    setRefreshing(true);
    loadPerformance();
  };

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

  if (loading) {
    return (
      <Screen header={<Header title="Performance" />}>
        <StateView loading />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen header={<Header title="Performance" />}>
        <StateView
          icon="cloud-offline-outline"
          tone="danger"
          title="Couldn't load your results"
          message={error}
        >
          <Button title="Try again" variant="secondary" onPress={retry} />
        </StateView>
      </Screen>
    );
  }

  if (data.total_attempts === 0) {
    return (
      <Screen header={<Header title="Performance" />}>
        <StateView
          icon="stats-chart-outline"
          title="No results yet"
          message="Finish a quiz and your accuracy, strongest topics and progress will appear here."
        >
          <Button
            title="Start a quiz"
            onPress={() => router.push("/quizInit")}
          />
        </StateView>
      </Screen>
    );
  }

  // Newest first for the list
  const recent = [...data.recent].reverse();

  return (
    <Screen
      scroll
      header={<Header title="Performance" />}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      {error && (
        <AppText
          variant="small"
          tone="danger"
          center
          style={styles.refreshError}
        >
          {error}
        </AppText>
      )}
      {/* SUMMARY */}
      <View style={styles.summary}>
        <Summary value={`${data.total_attempts}`} label="Quizzes" />
        <View style={styles.summaryDivider} />
        <Summary value={`${data.accuracy}%`} label="Accuracy" />
        <View style={styles.summaryDivider} />
        <Summary value={`${data.best_score}%`} label="Best" />
      </View>
      <AppText variant="caption" tone="muted" style={styles.note}>
        {data.total_correct} of {data.total_questions} questions answered
        correctly
      </AppText>

      {/* RECENT QUIZZES */}
      <SectionToggle
        label="Recent quizzes"
        count={recent.length}
        open={showRecent}
        onToggle={() => setShowRecent(!showRecent)}
      />
      {showRecent && (
        <View style={styles.group}>
          {recent.map((attempt, index) => (
            <Pressable
              key={attempt.id}
              accessibilityRole="button"
              onPress={() => openAttempt(attempt.id)}
              disabled={openingId !== null}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.flex}>
                <AppText variant="body">
                  {formatDate(attempt.created_at)}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {attempt.difficulty}
                </AppText>
              </View>

              {openingId === attempt.id ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <>
                  <View style={styles.scoreCol}>
                    <AppText variant="bodyStrong">
                      {attempt.score}/{attempt.total_questions}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {attempt.percent}%
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textMuted}
                  />
                </>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* BY TOPIC */}
      {data.topics.length > 0 && (
        <>
          <SectionToggle
            label="By topic"
            count={data.topics.length}
            open={showTopics}
            onToggle={() => setShowTopics(!showTopics)}
          />
          {showTopics && (
            <View style={styles.group}>
              {data.topics.map((topic, index) => (
                <TopicDropdown
                  key={topic.name}
                  topic={topic}
                  first={index === 0}
                  open={openTopic === topic.name}
                  onToggle={() =>
                    setOpenTopic(openTopic === topic.name ? null : topic.name)
                  }
                  openingId={openingId}
                  onOpenQuiz={openAttempt}
                />
              ))}
            </View>
          )}
        </>
      )}

      {/* BY DIFFICULTY */}
      {data.difficulties.length > 0 && (
        <>
          <AppText variant="label" tone="muted" style={styles.sectionLabel}>
            By difficulty
          </AppText>
          <Breakdown rows={data.difficulties} />
        </>
      )}
    </Screen>
  );
}

// A section heading that collapses/expands the list under it
function SectionToggle({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${label}, ${open ? "collapse" : "expand"}`}
      hitSlop={6}
      onPress={() => {
        tapHaptic();
        onToggle();
      }}
      style={({ pressed }) => [
        styles.sectionToggle,
        pressed && styles.togglePressed,
      ]}
    >
      <AppText variant="label" tone="muted" style={styles.flex}>
        {label} ({count})
      </AppText>
      <AppText variant="caption" tone="accent">
        {open ? "Hide" : "Show"}
      </AppText>
      <Ionicons
        name={open ? "chevron-up" : "chevron-down"}
        size={16}
        color={colors.accentText}
      />
    </Pressable>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

// A topic row that opens to show its results by difficulty and every
// quiz it appeared in (tap a quiz to review it).
function TopicDropdown({
  topic,
  first,
  open,
  onToggle,
  openingId,
  onOpenQuiz,
}: {
  topic: TopicRow;
  first: boolean;
  open: boolean;
  onToggle: () => void;
  openingId: number | null;
  onOpenQuiz: (attemptId: number) => void;
}) {
  return (
    <View style={!first && styles.rowDivider}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          tapHaptic();
          onToggle();
        }}
        style={({ pressed }) => [
          styles.breakdownRow,
          pressed && styles.rowPressed,
        ]}
      >
        <View style={styles.breakdownTop}>
          <AppText variant="body" style={styles.flex} numberOfLines={1}>
            {topic.name}
          </AppText>
          <AppText variant="caption" tone="muted">
            {topic.correct}/{topic.total}
          </AppText>
          <AppText variant="bodyStrong" style={styles.percent}>
            {topic.accuracy}%
          </AppText>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
          />
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${topic.accuracy}%` }]} />
        </View>
      </Pressable>

      {open && (
        <View style={styles.details}>
          <View style={styles.levels}>
            {topic.difficulties.map((level) => (
              <View key={level.name} style={styles.level}>
                <AppText variant="bodyStrong">{level.accuracy}%</AppText>
                <AppText variant="caption" tone="muted">
                  {level.name} · {level.correct}/{level.total}
                </AppText>
              </View>
            ))}
          </View>

          <AppText variant="caption" tone="muted" style={styles.detailsLabel}>
            Quizzes with this topic ({topic.quizzes.length})
          </AppText>
          {topic.quizzes.map((quiz) => (
            <Pressable
              key={quiz.id}
              accessibilityRole="button"
              onPress={() => onOpenQuiz(quiz.id)}
              disabled={openingId !== null}
              style={({ pressed }) => [
                styles.quizRow,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.flex}>
                <AppText variant="small">{formatDate(quiz.created_at)}</AppText>
                <AppText variant="caption" tone="muted">
                  {quiz.difficulty}
                </AppText>
              </View>
              {openingId === quiz.id ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <>
                  <AppText variant="small" tone="secondary">
                    {quiz.correct}/{quiz.total} · {quiz.percent}%
                  </AppText>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.textMuted}
                  />
                </>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// A list of rows: name, correct/total, percentage and a thin bar
function Breakdown({ rows }: { rows: BreakdownRow[] }) {
  return (
    <View style={styles.group}>
      {rows.map((row, index) => (
        <View
          key={row.name}
          style={[styles.breakdownRow, index > 0 && styles.rowDivider]}
        >
          <View style={styles.breakdownTop}>
            <AppText variant="body" style={styles.flex} numberOfLines={1}>
              {row.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {row.correct}/{row.total}
            </AppText>
            <AppText variant="bodyStrong" style={styles.percent}>
              {row.accuracy}%
            </AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${row.accuracy}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  refreshError: {
    marginBottom: spacing.md,
  },
  flex: {
    flex: 1,
  },
  // SUMMARY

  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
  },
  note: {
    marginTop: spacing.sm,
    textAlign: "center",
  },

  // LISTS

  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    // Same spacing as the plain section labels
    marginTop: spacing.xxl - spacing.xs,
    marginBottom: spacing.md - spacing.xs,
    paddingVertical: spacing.xs,
  },
  togglePressed: {
    opacity: 0.6,
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  group: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  scoreCol: {
    alignItems: "flex-end",
  },

  // BREAKDOWN

  breakdownRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  breakdownTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  percent: {
    width: 46,
    textAlign: "right",
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  // TOPIC DROPDOWN

  details: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  levels: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  level: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  detailsLabel: {
    marginTop: spacing.md,
  },
  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
