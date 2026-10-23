import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import {
  type AdminQuestion,
  DIFFICULTIES,
  type Difficulty,
  type QuestionStatus,
} from "@/lib/admin";
import { showAlert } from "@/lib/alert";
import { ApiError, apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Badge } from "@/ui/Badge";
import { Brand, Bullet } from "@/ui/Brand";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Chip, SegmentedControl } from "@/ui/Choice";
import { selectHaptic } from "@/ui/haptics";
import { IconButton } from "@/ui/Header";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { layout, radius, spacing, typography } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Admin only: the teaching workspace. Shows the question bank by status,
// and is the way in to writing a question by hand or generating some with
// AI. AI questions arrive as "pending"; approving makes them "active"
// (used in quizzes), rejecting hides them. The backend refuses all of this
// for non-admins.

const STATUSES: readonly QuestionStatus[] = ["pending", "active", "rejected"];
const STATUS_LABELS: Record<QuestionStatus, string> = {
  pending: "Pending",
  active: "Live",
  rejected: "Rejected",
};
const STATUS_TONES = { pending: "warning", active: "accent", rejected: "danger" } as const;

type Counts = Record<QuestionStatus, number>;

// What GET /admin/questions returns
type ListResponse = {
  questions: AdminQuestion[];
  counts: Counts;
  topics: string[]; // every topic, for the filter chips
  live_topics: string[]; // topics players can already see
};

const ALL = "All";
const DIFFICULTY_FILTERS = [ALL, ...DIFFICULTIES] as const;
type DifficultyFilter = typeof ALL | Difficulty;

export default function AdminScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [status, setStatus] = useState<QuestionStatus>("pending");
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters: topic and difficulty are applied by the backend, the search
  // box filters the loaded list as you type.
  const [topics, setTopics] = useState<string[]>([]);
  // A pending question outside these adds a new topic when approved
  const [liveTopics, setLiveTopics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>(ALL);
  const [search, setSearch] = useState("");

  const load = useCallback(
    (
      which: QuestionStatus,
      topic: string | null,
      difficulty: DifficultyFilter,
      pulled = false, // pull-to-refresh shows its own spinner
    ) => {
      if (!pulled) {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({ status: which });
      if (topic) {
        params.set("topic", topic);
      }
      if (difficulty !== ALL) {
        params.set("difficulty", difficulty);
      }

      apiRequest(`/admin/questions?${params}`, { auth: true })
        .then((data: ListResponse) => {
          setQuestions(data.questions);
          setCounts(data.counts);
          setTopics(data.topics);
          setLiveTopics(data.live_topics);
        })
        .catch((loadError) => {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load questions.",
          );
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [],
  );

  // Reload whenever this screen comes back into view, e.g. after adding,
  // editing or generating questions.
  useFocusEffect(
    useCallback(() => {
      load(status, topicFilter, difficultyFilter);
    }, [load, status, topicFilter, difficultyFilter]),
  );

  useFocusEffect(
    useCallback(() => {
      apiRequest("/me", { auth: true })
        .then((me) => setFirstName((me.full_name || me.email).split(/[\s@]/)[0]))
        .catch(() => {});
    }, []),
  );

  const query = search.trim().toLowerCase();
  const shown = query
    ? questions.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.options.some((option) => option.toLowerCase().includes(query)),
      )
    : questions;
  const filtering = topicFilter !== null || difficultyFilter !== ALL || query;

  const setQuestionStatus = async (
    question: AdminQuestion,
    newStatus: QuestionStatus,
  ) => {
    setBusyId(question.id);

    try {
      await apiRequest(`/admin/questions/${question.id}`, {
        method: "PATCH",
        auth: true,
        body: { status: newStatus, expected_version: question.version },
      });

      // It no longer belongs in this tab
      setQuestions((current) => current.filter((q) => q.id !== question.id));
      if (newStatus === "active" && !liveTopics.includes(question.topic)) {
        setLiveTopics((current) => [...current, question.topic]);
      }
      setCounts((current) =>
        current
          ? {
              ...current,
              [question.status]: current[question.status] - 1,
              [newStatus]: current[newStatus] + 1,
            }
          : current,
      );
    } catch (updateError) {
      showAlert(
        "Could not update",
        updateError instanceof Error ? updateError.message : undefined,
      );
      // Someone else changed it - show the list as it is now
      if (updateError instanceof ApiError && updateError.status === 409) {
        load(status, topicFilter, difficultyFilter);
      }
    } finally {
      setBusyId(null);
    }
  };

  const openEditor = (question: AdminQuestion) => {
    router.push({
      pathname: "/admin-question",
      params: { question: JSON.stringify(question) },
    });
  };

  return (
    <Screen
      scroll
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(status, topicFilter, difficultyFilter, true);
      }}
    >
      <Reveal order={0} style={styles.topBar}>
        <Brand badge="Admin" />
        <IconButton icon="close" label="Leave workspace" onPress={() => goBack()} />
      </Reveal>

      <Reveal order={1} style={styles.greeting}>
        <AppText variant="label" tone="accent">
          Your teaching workspace
        </AppText>
        <AppText variant="title">Hello, {firstName ?? "there"}.</AppText>
      </Reveal>

      {/* STATS */}
      <Reveal order={2} style={styles.stats}>
        <Card tinted style={styles.stat}>
          <View style={styles.statHead}>
            <AppText variant="caption" tone="secondary">
              Live questions
            </AppText>
            <Ionicons name="layers-outline" size={16} color={colors.accentText} />
          </View>
          <AppText variant="title" style={styles.statValue}>
            {counts ? String(counts.active).padStart(2, "0") : "--"}
          </AppText>
          <AppText variant="caption" tone="accent">
            in {liveTopics.length} {liveTopics.length === 1 ? "topic" : "topics"}
          </AppText>
        </Card>
        <Card style={styles.stat}>
          <View style={styles.statHead}>
            <AppText variant="caption" tone="secondary">
              Awaiting review
            </AppText>
            <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
          </View>
          <AppText variant="title" style={styles.statValue}>
            {counts ? String(counts.pending).padStart(2, "0") : "--"}
          </AppText>
          <AppText variant="caption" tone="muted">
            {counts?.pending ? "AI drafts to check" : "All caught up"}
          </AppText>
        </Card>
      </Reveal>

      {/* ACTIONS */}
      <Reveal order={3} style={styles.actionsBlock}>
        <Button
          title="Add a question"
          onPress={() => router.push("/admin-question")}
        />
        <Button
          title="Generate with AI"
          variant="secondary"
          onPress={() => router.push("/admin-generate")}
        />
      </Reveal>

      {/* QUESTION BANK */}
      <Reveal order={4} style={styles.sectionHeader}>
        <AppText variant="heading">Question bank</AppText>
        {!loading && !error && (
          <AppText variant="caption" tone="accent">
            {shown.length} shown
          </AppText>
        )}
      </Reveal>

      <Reveal order={5} style={styles.filters}>
        <View style={styles.pills}>
          {STATUSES.map((value) => (
            <Chip
              key={value}
              label={
                counts ? `${STATUS_LABELS[value]} ${counts[value]}` : STATUS_LABELS[value]
              }
              selected={status === value}
              onPress={() => {
                setStatus(value);
                setOpenId(null);
              }}
            />
          ))}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions and options"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showFilters ? "Hide filters" : "Show filters"}
            accessibilityState={{ expanded: showFilters }}
            hitSlop={layout.hitSlop}
            onPress={() => {
              selectHaptic();
              setShowFilters((current) => !current);
            }}
            style={[
              styles.filterButton,
              (showFilters || topicFilter || difficultyFilter !== ALL) &&
                styles.filterButtonOn,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={showFilters ? colors.onInk : colors.text}
            />
          </Pressable>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip
                label="All topics"
                selected={topicFilter === null}
                onPress={() => setTopicFilter(null)}
              />
              {topics.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  selected={topicFilter === name}
                  onPress={() => setTopicFilter(topicFilter === name ? null : name)}
                />
              ))}
            </ScrollView>
            <SegmentedControl
              options={DIFFICULTY_FILTERS}
              value={difficultyFilter}
              onChange={setDifficultyFilter}
            />
          </View>
        )}
      </Reveal>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : error ? (
        <StateView
          tone="danger"
          title="Couldn't load questions"
          message={error}
        >
          <Button
            title="Try again"
            variant="secondary"
            onPress={() => load(status, topicFilter, difficultyFilter)}
          />
        </StateView>
      ) : shown.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="bodyStrong" center>
            {filtering
              ? "No questions match these filters"
              : status === "pending"
                ? "Nothing to review"
                : "No questions here"}
          </AppText>
          {status === "pending" && !filtering && (
            <AppText variant="small" tone="secondary" center>
              AI-generated questions wait here until you approve them.
            </AppText>
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {shown.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              open={openId === question.id}
              busy={busyId === question.id}
              newTopic={
                question.status !== "active" &&
                !liveTopics.includes(question.topic)
              }
              onToggle={() =>
                setOpenId((current) => (current === question.id ? null : question.id))
              }
              onApprove={() => setQuestionStatus(question, "active")}
              onReject={() => setQuestionStatus(question, "rejected")}
              onRestore={() => setQuestionStatus(question, "pending")}
              onEdit={() => openEditor(question)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

// One question in the bank. Collapsed it is a compact row; tapping it
// shows the options, the explanation and the review actions.
function QuestionRow({
  question,
  open,
  busy,
  newTopic,
  onToggle,
  onApprove,
  onReject,
  onRestore,
  onEdit,
}: {
  question: AdminQuestion;
  open: boolean;
  busy: boolean;
  newTopic: boolean; // approving it adds this topic to the app
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRestore: () => void;
  onEdit: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          selectHaptic();
          onToggle();
        }}
        style={styles.rowHead}
      >
        <Bullet style={styles.bullet} />
        <View style={styles.rowText}>
          <AppText variant="bodyStrong" numberOfLines={open ? undefined : 2}>
            {question.question}
          </AppText>
          <AppText variant="caption" tone="muted">
            {question.topic} · {question.difficulty} · {question.options.length} options
          </AppText>
          <View style={styles.badges}>
            <Badge
              label={STATUS_LABELS[question.status]}
              tone={STATUS_TONES[question.status]}
            />
            <Badge label={question.source === "ai" ? "AI" : "Manual"} tone="neutral" />
            {newTopic && <Badge label="New topic" tone="warning" />}
            {question.review_note && !open && <Badge label="Flagged" tone="danger" />}
          </View>
        </View>
        {busy ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textMuted}
          />
        )}
      </Pressable>

      {open && (
        <View style={styles.details}>
          <View style={styles.options}>
            {question.options.map((option, index) => {
              const correct = index === question.correct_index;

              return (
                <View
                  key={index}
                  style={[styles.option, correct && styles.optionCorrect]}
                >
                  <AppText
                    variant="caption"
                    style={[styles.letter, correct && styles.letterCorrect]}
                  >
                    {String.fromCharCode(65 + index)}
                  </AppText>
                  <AppText
                    variant="small"
                    tone={correct ? "success" : "secondary"}
                    style={styles.optionText}
                  >
                    {option}
                  </AppText>
                  {correct && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  )}
                </View>
              );
            })}
          </View>

          {question.explanation && (
            <AppText variant="small" tone="secondary">
              {question.explanation}
            </AppText>
          )}

          {question.review_note && (
            <View style={styles.warning}>
              <Ionicons name="warning-outline" size={16} color={colors.warning} />
              <AppText variant="small" style={styles.warningText}>
                {question.review_note}
              </AppText>
            </View>
          )}

          <View style={styles.actions}>
            {question.status !== "active" && (
              <Button
                title="Approve"
                size="sm"
                disabled={busy}
                onPress={onApprove}
                style={styles.action}
              />
            )}
            <Button
              title="Edit"
              size="sm"
              variant="secondary"
              disabled={busy}
              onPress={onEdit}
              style={styles.action}
            />
            {question.status === "rejected" ? (
              <Button
                title="To pending"
                size="sm"
                variant="ghost"
                disabled={busy}
                onPress={onRestore}
                style={styles.action}
              />
            ) : (
              <Button
                title={question.status === "active" ? "Unpublish" : "Reject"}
                size="sm"
                variant="danger"
                disabled={busy}
                onPress={onReject}
                style={styles.action}
              />
            )}
          </View>
        </View>
      )}
    </Card>
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
  stats: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  stat: {
    flex: 1,
    padding: spacing.md + 2,
    gap: 2,
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    marginTop: spacing.xs,
  },
  actionsBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },
  filters: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: {
    ...typography.small,
    flex: 1,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterPanel: {
    gap: spacing.md,
  },
  chips: {
    gap: spacing.sm,
  },
  loading: {
    marginVertical: spacing.xxl,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.sm + 2,
  },
  card: {
    padding: spacing.md,
  },
  rowHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  // Lines the dot up with the first line of the question
  bullet: {
    marginTop: 7,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  details: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  options: {
    gap: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  optionCorrect: {
    backgroundColor: colors.successSoft,
  },
  letter: {
    width: 22,
    height: 22,
    lineHeight: 22,
    textAlign: "center",
    borderRadius: radius.sm - 2,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
    color: colors.textSecondary,
  },
  letterCorrect: {
    backgroundColor: colors.success,
    color: colors.onAccent,
  },
  optionText: {
    flex: 1,
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.warningSoft,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
}));
