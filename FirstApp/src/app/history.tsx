import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

import { ApiError, apiRequest } from "@/lib/api";
import { AppText } from "@/ui/AppText";
import { Bullet } from "@/ui/Brand";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Header } from "@/ui/Header";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { TabBar } from "@/ui/TabBar";
import { StateView } from "@/ui/StateView";
import { type Palette, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Quiz history lives in Supabase (PostgreSQL), not on the device.
// The backend only returns the logged-in user's attempts, so history
// follows the user across devices and survives reinstalling the app.

type QuizAttempt = {
  id: number;
  score: number;
  total_questions: number;
  topics: string[]; // only topics the user answered questions in
  difficulty: string;
  created_at: string;
};

function scoreColor(colors: Palette, percent: number) {
  if (percent >= 70) return colors.success;
  if (percent >= 50) return colors.accent;
  return colors.warning;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const loadHistory = () =>
    apiRequest("/quiz-attempts", { auth: true })
      .then((attempts: QuizAttempt[]) => {
        setHistory(attempts);
        setError(null);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your quiz history.",
        );
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });

  useEffect(() => {
    loadHistory();
  }, []);

  const retry = () => {
    setLoading(true);
    loadHistory();
  };

  const refresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // The list doesn't include answers (keeps it fast), so fetch them on tap
  const openReview = async (attemptId: number) => {
    setOpeningId(attemptId);

    try {
      const attempt = await apiRequest(`/quiz-attempts/${attemptId}`, {
        auth: true,
      });

      router.push({
        pathname: "/review",
        params: {
          answers: JSON.stringify(attempt.answers),
        },
      });
    } catch (openError) {
      if (!(openError instanceof ApiError && openError.status === 401)) {
        setError(
          openError instanceof Error
            ? openError.message
            : "Could not open this attempt.",
        );
      }
    } finally {
      setOpeningId(null);
    }
  };

  const header = <Header title="My quizzes" hideBack />;

  if (loading) {
    return (
      <Screen tabBar={<TabBar active="history" />} header={header}>
        <StateView loading />
      </Screen>
    );
  }

  if (error && history.length === 0) {
    return (
      <Screen tabBar={<TabBar active="history" />} header={header}>
        <StateView
          tone="danger"
          title="Couldn't load your history"
          message={error}
        >
          <Button title="Try again" variant="secondary" onPress={retry} />
        </StateView>
      </Screen>
    );
  }

  if (history.length === 0) {
    return (
      <Screen tabBar={<TabBar active="history" />} header={header}>
        <StateView
          title="No quizzes yet"
          message="Every quiz you finish is saved here, so you can review your answers later."
        >
          <Button
            title="Start a quiz"
            onPress={() => router.push("/quizInit")}
          />
        </StateView>
      </Screen>
    );
  }

  return (
    <Screen tabBar={<TabBar active="history" />} header={header}>
      {error && (
        <AppText variant="small" tone="danger" center style={styles.error}>
          {error}
        </AppText>
      )}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        }
        renderItem={({ item, index }) => {
          const percent = item.total_questions
            ? Math.round((item.score / item.total_questions) * 100)
            : 0;
          const color = scoreColor(colors, percent);

          return (
            // Only the first screenful staggers in; later rows just appear
            <Reveal order={Math.min(index, 8)}>
              <Card
                onPress={() => openReview(item.id)}
                accessibilityLabel={`${item.score} of ${item.total_questions}, ${item.difficulty}. Open review`}
                style={styles.item}
              >
                <Bullet style={{ backgroundColor: color }} />

                <View style={styles.itemText}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {item.topics.length > 0
                      ? item.topics.join(", ")
                      : "No questions answered"}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {item.difficulty} · {formatDate(item.created_at)}
                  </AppText>
                </View>

                <AppText variant="heading" style={{ color }}>
                  {item.score}/{item.total_questions}
                </AppText>

                {openingId === item.id ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </Card>
            </Reveal>
          );
        }}
      />
    </Screen>
  );
}

const useStyles = createStyles((colors) => ({
  error: {
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
}));
