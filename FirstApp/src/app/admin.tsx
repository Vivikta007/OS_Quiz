import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
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
import { apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Chip, SegmentedControl } from "@/ui/Choice";
import { Header, IconButton } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { colors, radius, spacing, typography } from "@/ui/theme";

// Admin only: review questions. AI-generated ones arrive as "pending";
// approving makes them "active" (used in quizzes), rejecting hides them.
// The backend refuses all of this for non-admins.

const STATUSES: readonly QuestionStatus[] = ["pending", "active", "rejected"];
const STATUS_LABELS: Record<QuestionStatus, string> = {
  pending: "Pending",
  active: "Live",
  rejected: "Rejected",
};

type Counts = Record<QuestionStatus, number>;

// What GET /admin/questions returns
type ListResponse = {
  questions: AdminQuestion[];
  counts: Counts;
  topics: string[]; // every topic, for the filter chips
};

const ALL = "All";
const DIFFICULTY_FILTERS = [ALL, ...DIFFICULTIES] as const;
type DifficultyFilter = typeof ALL | Difficulty;

export default function AdminScreen() {
  const [status, setStatus] = useState<QuestionStatus>("pending");
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters: topic and difficulty are applied by the backend, the search
  // box filters the loaded list as you type.
  const [topics, setTopics] = useState<string[]>([]);
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

  // Reload whenever this screen comes back into view, e.g. after editing
  // a question or generating new ones.
  useFocusEffect(
    useCallback(() => {
      load(status, topicFilter, difficultyFilter);
    }, [load, status, topicFilter, difficultyFilter]),
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
        body: { status: newStatus },
      });

      // It no longer belongs in this tab
      setQuestions((current) => current.filter((q) => q.id !== question.id));
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

  const header = (
    <Header
      title="Question Review"
      right={
        <IconButton
          icon="sparkles"
          label="Generate questions with AI"
          onPress={() => router.push("/admin-generate")}
        />
      }
    />
  );

  return (
    <Screen
      header={header}
      scroll
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(status, topicFilter, difficultyFilter, true);
      }}
    >
      <SegmentedControl
        options={STATUSES}
        value={status}
        onChange={setStatus}
        format={(value) =>
          counts
            ? `${STATUS_LABELS[value]} (${counts[value]})`
            : STATUS_LABELS[value]
        }
      />

      <View style={styles.filters}>
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

        <TextInput
          style={styles.search}
          placeholder="Search questions and options"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {!loading && !error && filtering && (
          <AppText variant="caption" tone="muted">
            Showing {shown.length} question{shown.length === 1 ? "" : "s"}
          </AppText>
        )}
      </View>

      {loading ? (
        <StateView loading />
      ) : error ? (
        <StateView
          icon="cloud-offline-outline"
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
        <StateView
          icon={filtering ? "search-outline" : "checkmark-done-outline"}
          title={
            filtering
              ? "No questions match these filters"
              : status === "pending"
                ? "Nothing to review"
                : "No questions here"
          }
          message={
            status === "pending" && !filtering
              ? "Generate new questions with AI and they will appear here for you to approve."
              : null
          }
        >
          {status === "pending" && !filtering && (
            <Button
              title="Generate questions"
              onPress={() => router.push("/admin-generate")}
            />
          )}
        </StateView>
      ) : (
        <View style={styles.list}>
          {shown.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              busy={busyId === question.id}
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

function QuestionCard({
  question,
  busy,
  onApprove,
  onReject,
  onRestore,
  onEdit,
}: {
  question: AdminQuestion;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onRestore: () => void;
  onEdit: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.meta}>
        <AppText variant="caption" tone="accent">
          {question.topic} · {question.difficulty}
        </AppText>
        {busy && <ActivityIndicator size="small" color={colors.accent} />}
        {!busy && question.source === "ai" && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={11} color={colors.accentText} />
            <AppText variant="caption" tone="accent">
              AI
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="bodyStrong">{question.question}</AppText>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const correct = index === question.correct_index;

          return (
            <View key={index} style={styles.option}>
              <Ionicons
                name={correct ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={correct ? colors.success : colors.textMuted}
              />
              <AppText
                variant="small"
                tone={correct ? "success" : "secondary"}
                style={styles.optionText}
              >
                {option}
              </AppText>
            </View>
          );
        })}
      </View>

      {question.explanation && (
        <AppText variant="small" tone="muted">
          {question.explanation}
        </AppText>
      )}

      {question.review_note && (
        <View style={styles.warning}>
          <Ionicons name="warning" size={16} color={colors.warning} />
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
            title={question.status === "active" ? "Remove" : "Reject"}
            size="sm"
            variant="danger"
            disabled={busy}
            onPress={onReject}
            style={styles.action}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  chips: {
    gap: spacing.sm,
  },
  search: {
    ...typography.body,
    height: 46,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
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
});
