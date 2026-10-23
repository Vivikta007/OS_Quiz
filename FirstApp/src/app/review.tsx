import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { goHome } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { SegmentedControl } from "@/ui/Choice";
import { Header } from "@/ui/Header";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { StateView } from "@/ui/StateView";
import { fonts, radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

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
  const styles = useStyles();
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
      <View style={styles.summary}>
        <AppText variant="title" center>
          {Math.round((correctCount / answerData.length) * 100)}%
        </AppText>
        <AppText variant="caption" tone="secondary" center>
          correct
        </AppText>
      </View>

      {wrongCount > 0 && (
        <View style={styles.filter}>
          <SegmentedControl
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </View>
      )}

      <View style={styles.list}>
        {shown.map(({ item, number }, index) => (
          <Reveal key={number} order={Math.min(index, 6)}>
            <QuestionReview item={item} number={number} />
          </Reveal>
        ))}
      </View>
    </Screen>
  );
}

function QuestionReview({ item, number }: { item: AnswerRecord; number: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
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
            {
              backgroundColor: isCorrect
                ? colors.successSoft
                : skipped
                  ? colors.surfaceRaised
                  : colors.dangerSoft,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{
              color: isCorrect
                ? colors.success
                : skipped
                  ? colors.textSecondary
                  : colors.danger,
            }}
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
              <View
                style={[
                  styles.letter,
                  correct && { backgroundColor: colors.success },
                  pickedWrong && { backgroundColor: colors.danger },
                ]}
              >
                <AppText
                  variant="caption"
                  style={[styles.letterText, (correct || pickedWrong) && styles.letterOn]}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </AppText>
              </View>
              <AppText variant="small" style={styles.optionText}>
                {option}
              </AppText>
            </View>
          );
        })}
      </View>

      {item.explanation && (
        <View style={styles.explanation}>
          <AppText variant="label" tone="accent">
            Why
          </AppText>
          <AppText variant="small" tone="secondary">
            {item.explanation}
          </AppText>
        </View>
      )}
    </Card>
  );
}

const useStyles = createStyles((colors) => ({
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
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  wrongOption: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  letter: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textSecondary,
  },
  letterOn: {
    color: colors.onAccent,
  },
  optionText: {
    flex: 1,
  },
  explanation: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
}));
