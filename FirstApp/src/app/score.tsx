import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import { goHome } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Bullet } from "@/ui/Brand";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Reveal } from "@/ui/Reveal";
import { Screen } from "@/ui/Screen";
import { fonts, type Palette, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

type AnswerRecord = {
  selectedAnswer: string;
  correctAnswer: string;
};

// The headline message and colour depend on how well the quiz went
function resultFor(colors: Palette, percent: number) {
  if (percent >= 80) {
    return {
      title: "Excellent work!",
      color: colors.success,
    };
  }
  if (percent >= 50) {
    return {
      title: "Good effort",
      color: colors.accent,
    };
  }
  return {
    title: "Keep practising",
    color: colors.warning,
  };
}

// Counts from 0 up to `target` with an ease-out, for the big score reveal
function useCountUp(target: number, delayMs: number, durationMs = 500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startedAt: number | null = null;
    const timer = setTimeout(() => {
      const step = (now: number) => {
        startedAt ??= now;
        const t = Math.min((now - startedAt) / durationMs, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, delayMs, durationMs]);

  return value;
}

export default function ScoreScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
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
  const result = resultFor(colors, percent);
  // Starts once the ring has faded in (Reveal order 3)
  const shownScore = useCountUp(scoreNumber, 120);
  const pad = (n: number) => String(n).padStart(2, "0");

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
      {/* Set left, not a centred badge */}
      <View style={styles.hero}>
        <Reveal order={0} style={styles.kicker}>
          <AppText variant="label" tone="muted">
            Result · {difficulty}
          </AppText>
        </Reveal>

        <Reveal order={1}>
          <AppText variant="title">{result.title}</AppText>
        </Reveal>

        {/* SCORE: a big editorial "07 / 10" */}
        <Reveal order={3} style={styles.scoreBlock}>
          <View
            style={styles.scoreLine}
            accessible
            accessibilityLabel={`${scoreNumber} of ${totalNumber} correct, ${percent} percent`}
          >
            <AppText style={styles.scoreBig}>{pad(shownScore)}</AppText>
            <AppText style={styles.scoreOf}> / {pad(totalNumber)}</AppText>
            <AppText variant="label" style={[styles.scorePercent, { color: result.color }]}>
              {percent}%
            </AppText>
          </View>

          {/* One mark per question, in the order they were asked */}
          <View style={styles.strip}>
            {answerList.map((answer, index) => {
              const correct =
                !!answer.selectedAnswer && answer.selectedAnswer === answer.correctAnswer;
              const skippedOne = !answer.selectedAnswer;
              return (
                <View
                  key={index}
                  style={[
                    styles.mark,
                    correct
                      ? { backgroundColor: colors.success }
                      : skippedOne
                        ? styles.markSkipped
                        : { backgroundColor: colors.danger },
                  ]}
                />
              );
            })}
          </View>
        </Reveal>
      </View>

      {/* BREAKDOWN - icon + label + number, so it never relies on colour alone */}
      <Reveal order={4}>
        <Card style={styles.breakdown}>
          <Stat
            color={colors.success}
            label="Correct"
            value={scoreNumber}
          />
          <View style={styles.divider} />
          <Stat color={colors.danger} label="Wrong" value={wrong} />
          <View style={styles.divider} />
          <Stat
            color={colors.textMuted}
            label="Skipped"
            value={skipped}
          />
        </Card>
      </Reveal>

      <Reveal order={5}>
        <AppText variant="caption" tone="muted" center style={styles.meta}>
          Saved to your history
        </AppText>
      </Reveal>
    </Screen>
  );
}

function Stat({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Bullet style={{ backgroundColor: color }} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  flex: {
    flex: 1,
  },
  hero: {
    paddingTop: spacing.xl,
  },
  kicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scoreBlock: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scoreLine: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreBig: {
    fontFamily: fonts.bodyBold,
    fontSize: 84,
    lineHeight: 92,
    color: colors.text,
    letterSpacing: -3,
  },
  scoreOf: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 30,
    lineHeight: 36,
    color: colors.textMuted,
  },
  scorePercent: {
    marginLeft: "auto",
  },
  strip: {
    flexDirection: "row",
    gap: 3,
    marginTop: spacing.sm,
  },
  mark: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  markSkipped: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
}));
