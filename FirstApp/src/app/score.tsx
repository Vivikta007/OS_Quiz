import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { type ComponentProps, useCallback } from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import { goHome } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing } from "@/ui/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AnswerRecord = {
  selectedAnswer: string;
  correctAnswer: string;
};

// The headline message and colour depend on how well the quiz went
function resultFor(percent: number) {
  if (percent >= 80) {
    return {
      title: "Excellent work!",
      message: "You really know this material.",
      color: colors.success,
      soft: colors.successSoft,
      icon: "trophy-outline" as IconName,
    };
  }
  if (percent >= 50) {
    return {
      title: "Good effort",
      message: "Review the ones you missed to lock them in.",
      color: colors.accent,
      soft: colors.accentSoft,
      icon: "thumbs-up-outline" as IconName,
    };
  }
  return {
    title: "Keep practising",
    message: "Review your answers - every attempt makes it stick.",
    color: colors.warning,
    soft: colors.warningSoft,
    icon: "barbell-outline" as IconName,
  };
}

export default function ScoreScreen() {
  const { score, total, answers, topics, difficulty, questionCount } =
    useLocalSearchParams<{
      score: string;
      total: string;
      answers: string;
      topics: string;
      difficulty: string;
      questionCount: string;
    }>();

  // Android's back button goes Home too - going "back" from the results
  // would land on the quiz setup screen, which is confusing.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          goHome();
          return true;
        },
      );

      return () => subscription.remove();
    }, []),
  );

  const scoreNumber = Number(score) || 0;
  const totalNumber = Number(total) || 0;
  const percent = totalNumber ? Math.round((scoreNumber / totalNumber) * 100) : 0;
  const result = resultFor(percent);

  let answerList: AnswerRecord[] = [];
  try {
    answerList = answers ? JSON.parse(answers) : [];
  } catch {
    answerList = [];
  }
  const skipped = answerList.filter((answer) => !answer.selectedAnswer).length;
  const wrong = totalNumber - scoreNumber - skipped;

  return (
    <Screen
      scroll
      footer={
        <>
          <Button
            title="Review answers"

            onPress={() =>
              router.push({ pathname: "/review", params: { answers } })
            }
          />
          <View style={styles.footerRow}>
            <Button
              title="Try again"
              variant="secondary"
              onPress={() =>
                router.replace({
                  pathname: "/quiz",
                  params: { topics, difficulty, questionCount },
                })
              }
              style={styles.flex}
            />
            <Button
              title="Home"
              variant="secondary"
              onPress={goHome}
              style={styles.flex}
            />
          </View>
        </>
      }
    >
      <View style={styles.hero}>
        <View style={[styles.iconCircle, { backgroundColor: result.soft }]}>
          <Ionicons name={result.icon} size={30} color={result.color} />
        </View>

        <AppText variant="title" center>
          {result.title}
        </AppText>
        <AppText variant="small" tone="secondary" center style={styles.message}>
          {result.message}
        </AppText>

        {/* SCORE */}
        <View style={[styles.scoreRing, { borderColor: result.color }]}>
          <AppText variant="display" style={styles.percent}>
            {percent}%
          </AppText>
          <AppText variant="small" tone="secondary">
            {scoreNumber} of {totalNumber} correct
          </AppText>
        </View>
      </View>

      {/* BREAKDOWN - icon + label + number, so it never relies on colour alone */}
      <Card style={styles.breakdown}>
        <Stat
          icon="checkmark-circle"
          color={colors.success}
          label="Correct"
          value={scoreNumber}
        />
        <View style={styles.divider} />
        <Stat icon="close-circle" color={colors.danger} label="Wrong" value={wrong} />
        <View style={styles.divider} />
        <Stat
          icon="remove-circle"
          color={colors.textMuted}
          label="Skipped"
          value={skipped}
        />
      </Card>

      <AppText variant="caption" tone="muted" center style={styles.meta}>
        {difficulty} · saved to your history
      </AppText>
    </Screen>
  );
}

function Stat({
  icon,
  color,
  label,
  value,
}: {
  icon: IconName;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  message: {
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  scoreRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
    backgroundColor: colors.surface,
  },
  percent: {
    fontSize: 44,
  },
  breakdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
  },
  meta: {
    marginTop: spacing.lg,
  },
  footerRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
