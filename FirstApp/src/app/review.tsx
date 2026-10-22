import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { goHome } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { SegmentedControl } from "@/ui/Choice";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { colors, radius, spacing } from "@/ui/theme";

type AnswerRecord = {
  question: string;
  options: string[];
  selectedAnswer: string; // "" when the question was skipped
  correctAnswer: string;
  explanation?: string | null; // missing on older attempts
};

const FILTERS = ["All", "Wrong only"] as const;

function parseAnswers(raw: string | undefined): AnswerRecord[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function ReviewScreen() {
  const { answers } = useLocalSearchParams<{ answers?: string }>();
  const answerData = parseAnswers(answers);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const correctCount = answerData.filter(
    (item) => item.selectedAnswer === item.correctAnswer,
  ).length;
  const wrongCount = answerData.length - correctCount;

  // Keep each question's original number when filtering
  const shown = answerData
    .map((item, index) => ({ item, number: index + 1 }))
    .filter(
      ({ item }) => filter === "All" || item.selectedAnswer !== item.correctAnswer,
    );

  const header = <Header title="Review answers" />;

  if (answerData.length === 0) {
    return (
      <Screen header={header}>
        <StateView
          icon="document-text-outline"
          title="Nothing to review"
          message="This quiz has no saved answers."
        >
          <Button title="Back to home" variant="secondary" onPress={goHome} />
        </StateView>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={header}
      footer={<Button title="Back to home" onPress={goHome} />}
    >
      <AppText variant="heading" center style={styles.summary}>
        {correctCount} of {answerData.length} correct
      </AppText>

      {wrongCount > 0 && (
        <View style={styles.filter}>
          <SegmentedControl
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            format={(option) =>
              option === "All" ? `All (${answerData.length})` : `Wrong (${wrongCount})`
            }
          />
        </View>
      )}

      <View style={styles.list}>
        {shown.map(({ item, number }) => (
          <QuestionReview key={number} item={item} number={number} />
        ))}
      </View>
    </Screen>
  );
}

function QuestionReview({ item, number }: { item: AnswerRecord; number: number }) {
  const skipped = !item.selectedAnswer;
  const isCorrect = item.selectedAnswer === item.correctAnswer;

  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <AppText variant="label" tone="accent">
          Question {number}
        </AppText>
        <View
          style={[
            styles.result,
            { backgroundColor: isCorrect ? colors.successSoft : colors.dangerSoft },
          ]}
        >
          <Ionicons
            name={isCorrect ? "checkmark" : skipped ? "remove" : "close"}
            size={14}
            color={isCorrect ? colors.success : colors.danger}
          />
          <AppText
            variant="caption"
            style={{ color: isCorrect ? colors.success : colors.danger }}
          >
            {isCorrect ? "Correct" : skipped ? "Not answered" : "Incorrect"}
          </AppText>
        </View>
      </View>

      <AppText variant="bodyStrong">{item.question}</AppText>

      <View style={styles.options}>
        {item.options.map((option, optionIndex) => {
          const correct = option === item.correctAnswer;
          const pickedWrong = !correct && option === item.selectedAnswer;

          return (
            <View
              key={option}
              style={[
                styles.option,
                correct && styles.correctOption,
                pickedWrong && styles.wrongOption,
              ]}
            >
              <AppText
                variant="small"
                tone={correct ? "success" : pickedWrong ? "danger" : "secondary"}
                style={styles.optionLetter}
              >
                {String.fromCharCode(65 + optionIndex)}
              </AppText>
              <AppText variant="small" style={styles.optionText}>
                {option}
              </AppText>
              {correct && (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              )}
              {pickedWrong && (
                <Ionicons name="close-circle" size={18} color={colors.danger} />
              )}
            </View>
          );
        })}
      </View>

      {item.explanation && (
        <View style={styles.explanation}>
          <Ionicons name="bulb-outline" size={16} color={colors.accentText} />
          <AppText variant="small" tone="secondary" style={styles.explanationText}>
            {item.explanation}
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  filter: {
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  wrongOption: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  optionLetter: {
    fontWeight: "700",
    width: 16,
  },
  optionText: {
    flex: 1,
  },
  explanation: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  explanationText: {
    flex: 1,
  },
});
