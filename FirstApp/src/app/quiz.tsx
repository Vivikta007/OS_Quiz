import { questions } from "@/data/questions";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router, useLocalSearchParams } from "expo-router";

import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// SHUFFLE

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// TYPES

type AnswerRecord = {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
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

  const [quizQuestions, setQuizQuestions] = useState<typeof questions>([]);

  const [showPalette, setShowPalette] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSubmitInterrupt, setShowSubmitInterrupt] = useState(false);

  const [showExitInterrupt, setShowExitInterrupt] = useState(false);

  // BUTTON ANIMATIONS

  const nextScale = useRef(new Animated.Value(1)).current;

  const paletteScale = useRef(new Animated.Value(1)).current;

  // PRESS ANIMATION

  const animatePress = (scale: Animated.Value, pressed: boolean) => {
    Animated.spring(scale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  // INITIALIZE QUIZ

  useEffect(() => {
    let selectedTopics: string[] = [];

    try {
      selectedTopics = topics ? JSON.parse(topics) : [];
    } catch {
      selectedTopics = [];
    }

    // STEP 1: FILTER BY TOPIC

    let filteredQuestions = questions.filter((question) => {
      return selectedTopics.includes(question.topic);
    });

    // STEP 2: FILTER BY DIFFICULTY

    if (difficulty !== "Adaptive") {
      filteredQuestions = filteredQuestions.filter(
        (question) => question.difficulty === difficulty,
      );
    }

    // STEP 3: ADAPTIVE MODE

    /*
      For now Adaptive mode creates a mixed-difficulty quiz.

      Later, this is where we can use:
      - previous scores
      - weak topics
      - strong topics
      - previous attempts
      - LLM-generated questions
    */

    if (difficulty === "Adaptive") {
      const easyQuestions = filteredQuestions.filter(
        (question) => question.difficulty === "Easy",
      );

      const mediumQuestions = filteredQuestions.filter(
        (question) => question.difficulty === "Medium",
      );

      const hardQuestions = filteredQuestions.filter(
        (question) => question.difficulty === "Hard",
      );

      const adaptivePool = shuffleArray([
        ...shuffleArray(easyQuestions).slice(0, 4),
        ...shuffleArray(mediumQuestions).slice(0, 4),
        ...shuffleArray(hardQuestions).slice(0, 4),
      ]);

      filteredQuestions = adaptivePool;
    }

    // STEP 4: SHUFFLE

    filteredQuestions = shuffleArray(filteredQuestions);

    // STEP 5: SELECT 10 QUESTIONS

    const selectedQuestions = filteredQuestions
      .slice(0, parseInt(questionCount ?? "10") || 10)
      .map((question) => {
        const correctIndex = question.correctAnswer.charCodeAt(0) - 65;

        const correctOption = question.options[correctIndex];

        // Shuffle options while keeping correct answer correct
        const shuffledOptions = shuffleArray(question.options);

        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: correctOption,
        };
      });

    // FALLBACK

    if (selectedQuestions.length === 0) {
      return;
    }

    // SAVE QUESTIONS

    setQuizQuestions(selectedQuestions);

    // CREATE STATE FOR EACH QUESTION

    setQuestionStates(
      selectedQuestions.map(() => ({
        selectedAnswer: null,
        visited: false,
      })),
    );
  }, [topics, difficulty, questionCount]);

  // ANDROID BACK BUTTON

  useEffect(() => {
    const handleBackPress = () => {
      // Don't allow navigation while submitting

      if (isSubmitting) {
        return true;
      }

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

    // CREATE FINAL ANSWERS

    const finalAnswers: AnswerRecord[] = quizQuestions.map(
      (quizQuestion, index) => ({
        question: quizQuestion.question,

        options: quizQuestion.options,

        selectedAnswer: questionStates[index]?.selectedAnswer ?? "",

        correctAnswer: quizQuestion.correctAnswer,
      }),
    );

    // CALCULATE SCORE

    const finalScore = questionStates.reduce(
      (total, state, index) => {
        return state.selectedAnswer === quizQuestions[index].correctAnswer
          ? total + 1
          : total;
      },

      0,
    );

    // CREATE RESULT OBJECT

    const result = {
      score: finalScore,

      total: quizQuestions.length,

      date: new Date().toISOString(),

      answers: finalAnswers,
    };

    // SHOW LOADING FOR 3 SECONDS

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // SAVE TO HISTORY

    const existingHistory = await AsyncStorage.getItem("quizHistory");

    const history = existingHistory ? JSON.parse(existingHistory) : [];

    history.push(result);

    await AsyncStorage.setItem("quizHistory", JSON.stringify(history));

    // STOP LOADING

    setIsSubmitting(false);

    // GO TO SCORE SCREEN

    router.push({
      pathname: "/score",
      params: {
        score: finalScore,
        total: quizQuestions.length,
        answers: JSON.stringify(finalAnswers),
        topics,
        difficulty,
        questionCount,
      },
    });
  };

  // LOADING SCREEN

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />

        <Text style={styles.loadingTitle}>PROCESSING QUIZ</Text>

        <Text style={styles.loadingSubtitle}>Calculating your results...</Text>
      </View>
    );
  }

  // WAIT FOR QUESTIONS

  if (quizQuestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />

        <Text style={styles.loadingTitle}>PREPARING QUIZ</Text>
      </View>
    );
  }

  // CURRENT QUESTION

  const question = quizQuestions[currentQuestion];

  const selectedAnswer =
    questionStates[currentQuestion]?.selectedAnswer ?? null;

  const progress = (currentQuestion + 1) / quizQuestions.length;

  // UI

  return (
    <View style={styles.container}>
      {/* 
          TOP BAR
       */}

      <View style={styles.topBar}>
        <View>
          <Text style={styles.questionCounter}>
            QUESTION {currentQuestion + 1}
            <Text style={styles.totalQuestions}>
              {" "}
              OF {quizQuestions.length}
            </Text>
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* QUESTION PALETTE BUTTON */}

        <Animated.View
          style={{
            transform: [
              {
                scale: paletteScale,
              },
            ],
          }}
        >
          <Pressable
            style={styles.paletteButton}
            onPress={() => setShowPalette(true)}
            onPressIn={() => animatePress(paletteScale, true)}
            onPressOut={() => animatePress(paletteScale, false)}
          >
            <Text style={styles.paletteButtonText}>☰</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* 
          QUESTION CARD
       */}

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>QUESTION {currentQuestion + 1}</Text>

        <Text style={styles.question}>{question.question}</Text>
      </View>

      {/* 
          OPTIONS
       */}

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);

          const isSelected = selectedAnswer === option;

          return (
            <Pressable
              key={option}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => {
                setQuestionStates((prev) =>
                  prev.map((state, stateIndex) =>
                    stateIndex === currentQuestion
                      ? {
                          ...state,

                          selectedAnswer: option,

                          visited: true,
                        }
                      : state,
                  ),
                );
              }}
            >
              <View
                style={[
                  styles.optionLetter,

                  isSelected && styles.selectedOptionLetter,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,

                    isSelected && styles.selectedOptionLetterText,
                  ]}
                >
                  {letter}
                </Text>
              </View>

              <Text style={styles.optionText}>{option}</Text>

              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* 
          NEXT / SUBMIT BUTTON
       */}

      <Animated.View
        style={{
          transform: [
            {
              scale: nextScale,
            },
          ],
        }}
      >
        <Pressable
          style={styles.nextButton}
          onPressIn={() => animatePress(nextScale, true)}
          onPressOut={() => animatePress(nextScale, false)}
          onPress={() => {
            // LAST QUESTION

            if (currentQuestion === quizQuestions.length - 1) {
              setShowSubmitInterrupt(true);

              return;
            }

            // MARK CURRENT QUESTION VISITED

            setQuestionStates((prev) =>
              prev.map((state, index) =>
                index === currentQuestion
                  ? {
                      ...state,

                      visited: true,
                    }
                  : state,
              ),
            );

            // MOVE TO NEXT QUESTION

            setCurrentQuestion(currentQuestion + 1);
          }}
        >
          <Text style={styles.nextText}>
            {currentQuestion === quizQuestions.length - 1
              ? "SUBMIT QUIZ"
              : "NEXT"}
          </Text>

          <Text style={styles.nextArrow}>→</Text>
        </Pressable>
      </Animated.View>

      {/* 
          QUESTION PALETTE
       */}

      <Modal
        visible={showPalette}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPalette(false)}
      >
        <View style={styles.paletteOverlay}>
          {/* BACKGROUND DISMISS */}

          <Pressable
            style={styles.backgroundDismiss}
            onPress={() => setShowPalette(false)}
          />

          {/* PALETTE */}

          <View style={styles.palette}>
            <Text style={styles.paletteTitle}>Question Palette</Text>

            <Text style={styles.paletteSubtitle}>Jump to any question</Text>

            <View style={styles.paletteGrid}>
              {quizQuestions.map((_, index) => {
                const state = questionStates[index];

                let numberStyle = styles.paletteNumber;

                // Current question

                if (index === currentQuestion) {
                  numberStyle = styles.currentNumber;
                }

                // Answered
                else if (state?.selectedAnswer !== null) {
                  numberStyle = styles.answeredNumber;
                }

                // Visited but unanswered
                else if (state?.visited) {
                  numberStyle = styles.skippedNumber;
                }

                return (
                  <Pressable
                    key={index}
                    style={numberStyle}
                    onPress={() => {
                      // Mark as visited

                      setQuestionStates((prev) =>
                        prev.map((state, stateIndex) =>
                          stateIndex === index
                            ? {
                                ...state,

                                visited: true,
                              }
                            : state,
                        ),
                      );

                      setCurrentQuestion(index);

                      setShowPalette(false);
                    }}
                  >
                    <Text style={styles.paletteNumberText}>{index + 1}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* LEGEND */}

            <View style={styles.legend}>
              <Text style={styles.legendText}>⚪ Not Visited</Text>

              <Text style={styles.legendText}>🟢 Answered</Text>

              <Text style={styles.legendText}>🔴 Skipped</Text>

              <Text style={styles.legendText}>🔵 Current</Text>
            </View>

            {/* CLOSE */}

            <Pressable
              style={styles.closePalette}
              onPress={() => setShowPalette(false)}
            >
              <Text style={styles.closePaletteText}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 
          SUBMIT CONFIRMATION
       */}

      <Modal
        visible={showSubmitInterrupt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitInterrupt(false)}
      >
        <View style={styles.interruptOverlay}>
          <View style={styles.interruptCard}>
            <Text style={styles.interruptTitle}>Submit Quiz?</Text>

            <Text style={styles.interruptMessage}>
              Are you sure you want to submit your quiz?
            </Text>

            <View style={styles.interruptButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowSubmitInterrupt(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={submitQuiz}>
                <Text style={styles.confirmButtonText}>SUBMIT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 
          EXIT QUIZ CONFIRMATION
       */}

      <Modal
        visible={showExitInterrupt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitInterrupt(false)}
      >
        <View style={styles.interruptOverlay}>
          <View style={styles.interruptCard}>
            <Text style={styles.interruptTitle}>End Quiz?</Text>

            <Text style={styles.interruptMessage}>
              Are you sure you want to leave? Your current attempt will be lost.
            </Text>

            <View style={styles.interruptButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowExitInterrupt(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={() => {
                  setShowExitInterrupt(false);

                  router.replace("/");
                }}
              >
                <Text style={styles.confirmButtonText}>END QUIZ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ========
// STYLES
// ========

const styles = StyleSheet.create({
  // MAIN SCREEN

  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 55,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 22,
  },

  loadingSubtitle: {
    color: "#A8B3C7",
    fontSize: 14,
    marginTop: 8,
  },

  // TOP BAR

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  questionCounter: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  totalQuestions: {
    color: "#A8B3C7",
    fontWeight: "500",
  },

  progressTrack: {
    width: 150,
    height: 5,
    backgroundColor: "#17233A",
    borderRadius: 5,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 5,
  },

  // PALETTE BUTTON

  paletteButton: {
    width: 48,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#17233A",
    borderWidth: 1,
    borderColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
  },

  paletteButtonText: {
    color: "#3B82F6",
    fontSize: 22,
    fontWeight: "bold",
  },

  // QUESTION CARD

  questionCard: {
    backgroundColor: "#17233A",
    borderRadius: 18,
    padding: 24,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#263653",
  },

  questionLabel: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 31,
  },

  // OPTIONS

  optionsContainer: {
    gap: 12,
    flex: 1,
  },

  option: {
    minHeight: 58,
    backgroundColor: "#17233A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263653",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  selectedOption: {
    backgroundColor: "#172F55",
    borderColor: "#3B82F6",
    borderWidth: 2,
  },

  optionLetter: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  selectedOptionLetter: {
    backgroundColor: "#3B82F6",
  },

  optionLetterText: {
    color: "#A8B3C7",
    fontSize: 14,
    fontWeight: "bold",
  },

  selectedOptionLetterText: {
    color: "#FFFFFF",
  },

  optionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
  },

  checkMark: {
    color: "#3B82F6",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // NEXT BUTTON

  nextButton: {
    height: 58,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#3B82F6",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  nextArrow: {
    color: "#FFFFFF",
    fontSize: 23,
    marginLeft: 10,
  },

  // PALETTE OVERLAY

  paletteOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 10, 20, 0.72)",
    justifyContent: "flex-end",
  },

  backgroundDismiss: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  // PALETTE

  palette: {
    width: "80%",
    height: "100%",
    alignSelf: "flex-end",
    backgroundColor: "#0F192B",
    padding: 25,
    paddingTop: 60,
    borderLeftWidth: 1,
    borderLeftColor: "#263653",
  },

  paletteTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  paletteSubtitle: {
    color: "#A8B3C7",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 28,
  },

  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
  },

  paletteNumber: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
  },

  answeredNumber: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1F7A3F",
    justifyContent: "center",
    alignItems: "center",
  },

  skippedNumber: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#B3261E",
    justifyContent: "center",
    alignItems: "center",
  },

  currentNumber: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },

  paletteNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  legend: {
    marginTop: 30,
    gap: 10,
  },

  legendText: {
    color: "#A8B3C7",
    fontSize: 14,
  },

  closePalette: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#17233A",
    borderWidth: 1,
    borderColor: "#263653",
    alignItems: "center",
  },

  closePaletteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },

  // INTERRUPT / CONFIRMATION MODALS

  interruptOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 10, 20, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  interruptCard: {
    width: "100%",
    backgroundColor: "#17233A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#263653",
    padding: 25,
  },

  interruptTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  interruptMessage: {
    color: "#A8B3C7",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },

  interruptButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F192B",
  },

  cancelButtonText: {
    color: "#A8B3C7",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
