import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { SegmentedControl } from "@/ui/Choice";
import { selectHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Bullet } from "@/ui/Brand";
import { Screen } from "@/ui/Screen";
import { fonts, layout, radius, spacing, typography } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

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
  const styles = useStyles();
  const { colors } = useTheme();
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Home can open this screen with one topic already picked
  const { topic: presetTopic } = useLocalSearchParams<{ topic?: string }>();
  const [selected, setSelected] = useState<string[]>(
    presetTopic ? [presetTopic] : [],
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("Adaptive");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [search, setSearch] = useState("");

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
  // The search only hides rows - topics picked before searching stay picked
  const query = search.trim().toLowerCase();
  const visible = query
    ? topics.filter((info) => info.topic.toLowerCase().includes(query))
    : topics;
  const visibleUsable = usable.filter((info) => visible.includes(info));
  const allSelected =
    visibleUsable.length > 0 &&
    visibleUsable.every((info) => chosen.includes(info.topic));

  const toggleTopic = (topic: string) => {
    selectHaptic();
    setSelected((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

  // Select / clear every topic in view (all of them, or the search results)
  const toggleAll = () => {
    selectHaptic();
    const names = visibleUsable.map((info) => info.topic);
    setSelected((current) =>
      allSelected
        ? current.filter((name) => !names.includes(name))
        : [...new Set([...current, ...names])],
    );
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
      : `${difficulty} · ${chosen.length} ${chosen.length === 1 ? "topic" : "topics"}`;

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
        {visibleUsable.length > 0 && (
          <Pressable onPress={toggleAll} hitSlop={10}>
            <AppText variant="small" tone="accent" style={styles.link}>
              {allSelected
                ? query ? "Clear these" : "Clear all"
                : query ? "Select these" : "Select all"}
            </AppText>
          </Pressable>
        )}
      </View>

      {topics.length > 0 && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={layout.hitSlop}
              onPress={() => setSearch("")}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

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
      ) : visible.length === 0 ? (
        <AppText variant="small" tone="secondary" center style={styles.noMatch}>
          {topics.length === 0
            ? "No topics yet."
            : `No topics match "${search.trim()}".`}
        </AppText>
      ) : (
        <View style={styles.list}>
          {visible.map((info, index) => {
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
                <Bullet />
                <AppText
                  variant="bodyStrong"
                  tone={disabled ? "muted" : "default"}
                  style={styles.rowLabel}
                  numberOfLines={1}
                >
                  {info.topic}
                </AppText>
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                    disabled && styles.checkboxDisabled,
                  ]}
                >
                  {isChecked && (
                    <Ionicons name="checkmark" size={15} color={colors.onAccent} />
                  )}
                </View>
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

const useStyles = createStyles((colors) => ({
  firstLabel: {
    marginTop: spacing.sm,
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
    fontFamily: fonts.bodySemiBold,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  noMatch: {
    paddingVertical: spacing.xl,
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
    minHeight: 56,
  },
  rowDivider: {
    borderTopWidth: 1,
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
    borderRadius: radius.pill,
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
}));
