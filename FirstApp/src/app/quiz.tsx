import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack, goHome } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { IconButton } from "@/ui/Header";
import { selectHaptic, successHaptic, warningHaptic } from "@/ui/haptics";
import { Screen } from "@/ui/Screen";
import { colors, layout, radius, spacing } from "@/ui/theme";

// A random ID for this quiz attempt. If saving is retried after a network
// error, the server sees the same ID and won't save the quiz twice.

function createAttemptId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random % 4) + 8;
    return value.toString(16);
  });
}

// TYPES

// A question from GET /quiz-questions. The server never sends the correct
// answer, so it can't be read from the app or its network traffic.
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  topic: string;
  difficulty: string;
};

// The marked result from POST /quiz-attempts (used by Score and Review)
type QuizAttemptResult = {
  score: number;
  total_questions: number;
  answers: {
    question: string;
    options: string[];
    selectedAnswer: string;
    correctAnswer: string;
  }[];
};

type QuestionState = {
  selectedAnswer: string | null;
  visited: boolean;
};

// QUIZ SCREEN

export default function QuizScreen() {
  // GET QUIZ SETTINGS FROM quizInit.tsx

  const { topics, difficulty, questionCount } = useLocalSearchParams<{
    topics?: string;
    difficulty?: string;
    questionCount?: string;
  }>();

  // STATE

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [showPalette, setShowPalette] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSubmitInterrupt, setShowSubmitInterrupt] = useState(false);

  const [showExitInterrupt, setShowExitInterrupt] = useState(false);

  // One ID per quiz; restarting the quiz mounts a new screen with a new ID.
  const [attemptId] = useState(createAttemptId);

  // LOAD QUESTIONS FROM THE SERVER
  // The backend picks random questions for the chosen topics and difficulty
  // from the database (Adaptive = a mix of Easy, Medium and Hard) and
  // shuffles their options.

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      let selectedTopics: string[] = [];

      try {
        selectedTopics = topics ? JSON.parse(topics) : [];
      } catch {
        selectedTopics = [];
      }

      // e.g. /quiz-questions?topics=Deadlocks&topics=File%20Systems&difficulty=Easy&count=10
      const query = [
        ...selectedTopics.map((topic) => `topics=${encodeURIComponent(topic)}`),
        `difficulty=${encodeURIComponent(difficulty ?? "")}`,
        `count=${encodeURIComponent(questionCount ?? "10")}`,
      ].join("&");

      try {
        const loaded: QuizQuestion[] = await apiRequest(
          `/quiz-questions?${query}`,
          { auth: true },
        );

        if (cancelled) return;

        setQuizQuestions(loaded);

        // CREATE STATE FOR EACH QUESTION

        setQuestionStates(
          loaded.map(() => ({
            selectedAnswer: null,
            visited: false,
          })),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load questions.",
          );
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [topics, difficulty, questionCount]);

  // PAUSE WHEN THE APP GOES TO THE BACKGROUND (App lifecycle / AppState)
  // The OS moves apps between states: active (on screen) -> background
  // (another app in front) -> active again. When the user returns to an
  // unfinished quiz, show the "Quiz Paused" screen on top of it.
  //
  // This lives in the quiz screen (not the whole app), so it only runs while
  // a quiz is really in progress: questions loaded, not submitting, and the
  // quiz screen in focus (useFocusEffect stops it while Paused is showing).

  const quizInProgress = quizQuestions.length > 0 && !isSubmitting;

  useFocusEffect(
    useCallback(() => {
      if (!quizInProgress) return;

      let previousState = AppState.currentState;

      const subscription = AppState.addEventListener("change", (nextState) => {
        if (previousState === "background" && nextState === "active") {
          router.push("/paused");
        }

        previousState = nextState;
      });

      return () => {
        subscription.remove();
      };
    }, [quizInProgress]),
  );

  // ANDROID BACK BUTTON

  useEffect(() => {
    const handleBackPress = () => {
      // Don't allow navigation while submitting

      if (isSubmitting) {
        return true;
      }

      warningHaptic();
      setShowExitInterrupt(true);

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [isSubmitting]);

  // SUBMIT QUIZ

  const submitQuiz = async () => {
    // Prevent duplicate submission

    if (isSubmitting) {
      return;
    }

    // Close confirmation modal

    setShowSubmitInterrupt(false);

    // Start loading

    setIsSubmitting(true);

    // WHAT THE USER PICKED (the server marks it - the app has no answers)

    const submittedAnswers = quizQuestions.map((quizQuestion, index) => ({
      question_id: quizQuestion.id,
      options: quizQuestion.options,
      selected_answer: questionStates[index]?.selectedAnswer ?? "",
    }));

    let selectedTopics: string[] = [];

    try {
      selectedTopics = topics ? JSON.parse(topics) : [];
    } catch {
      selectedTopics = [];
    }

    // SEND TO THE SERVER, WHICH MARKS AND SAVES THE QUIZ

    let attempt: QuizAttemptResult;

    try {
      attempt = await apiRequest("/quiz-attempts", {
        method: "POST",
        auth: true,
        body: {
          client_attempt_id: attemptId,
          topics: selectedTopics,
          difficulty,
          answers: submittedAnswers,
        },
      });
    } catch (error) {
      setIsSubmitting(false);

      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      showAlert("Could not save your quiz", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: () => submitQuiz() },
      ]);

      return;
    }

    // STOP LOADING

    setIsSubmitting(false);
    successHaptic();

    // GO TO SCORE SCREEN (replace, so Back doesn't return to a finished quiz)

    router.replace({
      pathname: "/score",
      params: {
        score: attempt.score,
        total: attempt.total_questions,
        answers: JSON.stringify(attempt.answers),
        topics,
        difficulty,
        questionCount,
      },
    });
  };

  // MOVING BETWEEN QUESTIONS
  // A question counts as "visited" once you've been on it, so the palette
  // can show questions you skipped.

  const markVisited = (indexes: number[]) => {
    setQuestionStates((prev) =>
      prev.map((state, index) =>
        indexes.includes(index) ? { ...state, visited: true } : state,
      ),
    );
  };

  const goToQuestion = (index: number) => {
    markVisited([currentQuestion, index]);
    setCurrentQuestion(index);
  };

  const chooseAnswer = (option: string) => {
    selectHaptic();
    setQuestionStates((prev) =>
      prev.map((state, index) =>
        index === currentQuestion
          ? { ...state, selectedAnswer: option, visited: true }
          : state,
      ),
    );
  };

  const openExitDialog = () => {
    warningHaptic();
    setShowExitInterrupt(true);
  };

  // SUBMITTING

  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <AppText variant="heading" style={styles.stateTitle}>
          Marking your quiz
        </AppText>
        <AppText variant="small" tone="secondary">
          This only takes a moment...
        </AppText>
      </SafeAreaView>
    );
  }

  // COULD NOT LOAD QUESTIONS (no questions for this choice, offline, ...)

  if (loadError) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.stateIcon}>
          <Ionicons name="alert-circle-outline" size={30} color={colors.danger} />
        </View>
        <AppText variant="heading" center style={styles.stateTitle}>
          Couldn&apos;t start the quiz
        </AppText>
        <AppText variant="small" tone="secondary" center>
          {loadError}
        </AppText>
        <Button
          title="Back to setup"
          variant="secondary"
          onPress={() => goBack("/quizInit")}
          style={styles.stateButton}
        />
      </SafeAreaView>
    );
  }

  // WAITING FOR QUESTIONS

  if (quizQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <AppText variant="heading" style={styles.stateTitle}>
          Preparing your quiz
        </AppText>
      </SafeAreaView>
    );
  }

  // CURRENT QUESTION

  const question = quizQuestions[currentQuestion];
  const selectedAnswer = questionStates[currentQuestion]?.selectedAnswer ?? null;
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === quizQuestions.length - 1;
  const progress = (currentQuestion + 1) / quizQuestions.length;
  const answeredCount = questionStates.filter(
    (state) => state.selectedAnswer !== null,
  ).length;
  const unansweredCount = quizQuestions.length - answeredCount;

  return (
    <Screen
      scroll
      header={
        <View>
          <View style={styles.topBar}>
            <IconButton icon="close" label="End quiz" onPress={openExitDialog} />

            <AppText variant="bodyStrong">
              Question {currentQuestion + 1}
              <AppText variant="body" tone="muted">
                {" "}
                of {quizQuestions.length}
              </AppText>
            </AppText>

            <IconButton
              icon="grid-outline"
              label="All questions"
              onPress={() => setShowPalette(true)}
            />
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      }
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Previous"
            variant="secondary"
            disabled={isFirst}
            onPress={() => goToQuestion(currentQuestion - 1)}
            style={styles.footerButton}
          />
          <Button
            title={isLast ? "Submit" : "Next"}
            onPress={() =>
              isLast
                ? setShowSubmitInterrupt(true)
                : goToQuestion(currentQuestion + 1)
            }
            style={styles.footerButton}
          />
        </View>
      }
    >
      {/* QUESTION */}
      <AppText variant="title" style={styles.question}>
        {question.question}
      </AppText>

      {/* OPTIONS */}
      <View style={styles.options}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const letter = String.fromCharCode(65 + index);

          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Option ${letter}: ${option}`}
              onPress={() => chooseAnswer(option)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && !isSelected && styles.optionPressed,
              ]}
            >
              <View
                style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}
              >
                <AppText
                  variant="caption"
                  style={[styles.optionLetterText, isSelected && styles.white]}
                >
                  {letter}
                </AppText>
              </View>

              <AppText variant="body" style={styles.optionText}>
                {option}
              </AppText>

              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={isSelected ? colors.accent : colors.borderStrong}
              />
            </Pressable>
          );
        })}
      </View>

      {/* QUESTION PALETTE (bottom sheet) */}
      <Modal
        visible={showPalette}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowPalette(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowPalette(false)}
          />

          <SafeAreaView edges={["bottom"]} style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <AppText variant="heading">All questions</AppText>
                <AppText variant="caption" tone="secondary">
                  {answeredCount} of {quizQuestions.length} answered
                </AppText>
              </View>
              <IconButton
                icon="close"
                label="Close"
                onPress={() => setShowPalette(false)}
              />
            </View>

            <View style={styles.paletteGrid}>
              {quizQuestions.map((_, index) => {
                const state = questionStates[index];
                const isCurrent = index === currentQuestion;
                const isAnswered = state?.selectedAnswer != null;
                const isSkipped = !isAnswered && state?.visited;

                return (
                  <Pressable
                    key={index}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${index + 1}`}
                    onPress={() => {
                      selectHaptic();
                      goToQuestion(index);
                      setShowPalette(false);
                    }}
                    style={[
                      styles.paletteCell,
                      isAnswered && styles.cellAnswered,
                      isSkipped && styles.cellSkipped,
                      isCurrent && styles.cellCurrent,
                    ]}
                  >
                    <AppText variant="bodyStrong">{index + 1}</AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legend}>
              <LegendItem color={colors.accent} label="Current" outline />
              <LegendItem color={colors.success} label="Answered" />
              <LegendItem color={colors.warning} label="Skipped" />
              <LegendItem color={colors.surfaceRaised} label="Not seen" />
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* SUBMIT CONFIRMATION */}
      <ConfirmDialog
        visible={showSubmitInterrupt}
        icon="checkmark-done-outline"
        title="Submit quiz?"
        message={
          unansweredCount > 0
            ? `You have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}. They'll be marked wrong.`
            : "You've answered every question. Ready to see your score?"
        }
        confirmLabel="Submit"
        cancelLabel="Keep going"
        onCancel={() => setShowSubmitInterrupt(false)}
        onConfirm={submitQuiz}
      />

      {/* EXIT CONFIRMATION */}
      <ConfirmDialog
        visible={showExitInterrupt}
        icon="exit-outline"
        title="End this quiz?"
        message="Your answers won't be saved."
        confirmLabel="End quiz"
        cancelLabel="Stay"
        destructive
        onCancel={() => setShowExitInterrupt(false)}
        onConfirm={() => {
          setShowExitInterrupt(false);
          goHome();
        }}
      />
    </Screen>
  );
}

function LegendItem({
  color,
  label,
  outline,
}: {
  color: string;
  label: string;
  outline?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          outline
            ? { borderColor: color, borderWidth: 2 }
            : { backgroundColor: color },
        ]}
      />
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // LOADING / ERROR STATES

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
  },
  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    marginTop: spacing.md,
  },
  stateButton: {
    marginTop: spacing.xl,
    alignSelf: "stretch",
  },

  // TOP BAR

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surface,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  // QUESTION

  question: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  // OPTIONS

  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterSelected: {
    backgroundColor: colors.accent,
  },
  optionLetterText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  white: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
  },

  // FOOTER

  footerRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },

  // PALETTE SHEET

  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  paletteCell: {
    width: 50,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cellAnswered: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(34, 197, 94, 0.45)",
  },
  cellSkipped: {
    backgroundColor: colors.warningSoft,
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  cellCurrent: {
    borderColor: colors.accent,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
});
