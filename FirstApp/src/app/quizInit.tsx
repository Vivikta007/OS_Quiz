import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { SegmentedControl } from "@/ui/Choice";
import { selectHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing } from "@/ui/theme";

const difficulties = ["Easy", "Medium", "Hard", "Adaptive"] as const;
type Difficulty = (typeof difficulties)[number];
const questionCounts = [5, 10, 15, 20] as const;

const difficultyHints: Record<Difficulty, string> = {
  Easy: "Core definitions and concepts.",
  Medium: "Apply concepts to short scenarios.",
  Hard: "Tricky, multi-step questions.",
  Adaptive:
    "Based on your results: more questions from weaker topics, harder ones where you score well, and ones you missed before.",
};

// From GET /topics: question counts per difficulty, plus this user's
// results in the topic (used to explain Adaptive mode)
type TopicInfo = {
  topic: string;
  counts: { Easy: number; Medium: number; Hard: number };
  answered: number;
  accuracy: number | null; // null = never answered
  level: "new" | "learning" | "improving" | "strong";
};

// How many questions the server can pick for one topic at this difficulty
function available(info: TopicInfo, difficulty: Difficulty) {
  if (difficulty === "Adaptive") {
    // Adaptive can use every question in the topic
    return info.counts.Easy + info.counts.Medium + info.counts.Hard;
  }
  return info.counts[difficulty];
}

export default function QuizInitScreen() {
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Adaptive");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const loadTopics = () =>
    apiRequest("/topics", { auth: true })
      .then((data: TopicInfo[]) => setTopics(data))
      .catch((error) =>
        setLoadError(
          error instanceof Error ? error.message : "Could not load topics.",
        ),
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    loadTopics();
  }, []);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    loadTopics();
  };

  // Topics with no questions at the chosen difficulty can't be picked
  const usable = topics.filter((info) => available(info, difficulty) > 0);
  const chosen = selected.filter((name) =>
    usable.some((info) => info.topic === name),
  );
  const allSelected = usable.length > 0 && chosen.length === usable.length;

  const totalAvailable = usable
    .filter((info) => chosen.includes(info.topic))
    .reduce((sum, info) => sum + available(info, difficulty), 0);

  const finalCount = Math.min(questionCount, totalAvailable);

  const toggleTopic = (topic: string) => {
    selectHaptic();
    setSelected((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

  const toggleAll = () => {
    selectHaptic();
    setSelected(allSelected ? [] : usable.map((info) => info.topic));
  };

  const startQuiz = () => {
    if (chosen.length === 0) return;

    router.push({
      pathname: "/quiz",
      params: {
        topics: JSON.stringify(chosen),
        difficulty,
        questionCount: questionCount.toString(),
      },
    });
  };

  const summary =
    chosen.length === 0
      ? "Select at least one topic"
      : `${finalCount} questions · ${difficulty} · ${chosen.length} ${chosen.length === 1 ? "topic" : "topics"}`;

  return (
    <Screen
      scroll
      header={<Header title="New quiz" />}
      footer={
        <>
          <AppText variant="caption" tone="secondary" center>
            {summary}
          </AppText>
          <Button
            title="Start quiz"
            onPress={startQuiz}
            disabled={chosen.length === 0}
          />
        </>
      }
    >
      {/* DIFFICULTY (first, because it changes how many questions exist) */}
      <AppText variant="label" tone="muted" style={styles.firstLabel}>
        Difficulty
      </AppText>
      <SegmentedControl
        options={difficulties}
        value={difficulty}
        onChange={setDifficulty}
      />
      <AppText variant="caption" tone="secondary" style={styles.hint}>
        {difficultyHints[difficulty]}
      </AppText>

      {/* TOPICS */}
      <View style={styles.sectionHeader}>
        <AppText variant="label" tone="muted">
          Topics
        </AppText>
        {usable.length > 0 && (
          <Pressable onPress={toggleAll} hitSlop={10}>
            <AppText variant="small" tone="accent" style={styles.link}>
              {allSelected ? "Clear all" : "Select all"}
            </AppText>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.listState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : loadError ? (
        <View style={styles.listState}>
          <AppText variant="small" tone="danger" center>
            {loadError}
          </AppText>
          <Button title="Try again" variant="secondary" size="sm" onPress={retry} />
        </View>
      ) : (
        <View style={styles.list}>
          {topics.map((info, index) => {
            const disabled = available(info, difficulty) === 0;
            const isChecked = !disabled && selected.includes(info.topic);

            return (
              <Pressable
                key={info.topic}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked, disabled }}
                disabled={disabled}
                onPress={() => toggleTopic(info.topic)}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                    disabled && styles.checkboxDisabled,
                  ]}
                >
                  {isChecked && (
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  )}
                </View>

                <AppText
                  variant="body"
                  tone={disabled ? "muted" : "default"}
                  style={styles.rowLabel}
                >
                  {info.topic}
                </AppText>

              </Pressable>
            );
          })}
        </View>
      )}

      {/* NUMBER OF QUESTIONS */}
      <AppText variant="label" tone="muted" style={styles.sectionLabel}>
        Questions
      </AppText>
      <SegmentedControl
        options={questionCounts}
        value={questionCount}
        onChange={setQuestionCount}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  firstLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  hint: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  link: {
    fontWeight: "600",
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  listState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  rowLabel: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxDisabled: {
    opacity: 0.4,
  },
});
