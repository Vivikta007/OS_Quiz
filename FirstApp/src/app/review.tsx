import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type AnswerRecord = {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
};

export default function ReviewScreen() {
  const { answers } = useLocalSearchParams();

  const answerData: AnswerRecord[] = answers
    ? JSON.parse(answers as string)
    : [];

  const homeScale = useRef(new Animated.Value(1)).current;

  const animatePress = (pressed: boolean) => {
    Animated.spring(homeScale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Answers</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {answerData.map((item, questionIndex) => {
          const isCorrect = item.selectedAnswer === item.correctAnswer;

          return (
            <View key={questionIndex} style={styles.questionCard}>
              <Text style={styles.questionNumber}>
                QUESTION {questionIndex + 1}
              </Text>

              <Text style={styles.question}>{item.question}</Text>

              {item.options.map((option, optionIndex) => {
                const isCorrectAnswer = option === item.correctAnswer;
                const isSelectedAnswer = option === item.selectedAnswer;

                let optionStyle = styles.option;

                if (isCorrectAnswer) {
                  optionStyle = styles.correctOption;
                } else if (isSelectedAnswer) {
                  optionStyle = styles.wrongOption;
                }

                return (
                  <View key={option} style={optionStyle}>
                    <Text style={styles.optionText}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </Text>
                  </View>
                );
              })}

              <Text
                style={isCorrect ? styles.correctText : styles.incorrectText}
              >
                {isCorrect ? "✓ Correct" : "✕ Incorrect"}
              </Text>
            </View>
          );
        })}

        <Animated.View style={{ transform: [{ scale: homeScale }] }}>
          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/")}
            onPressIn={() => animatePress(true)}
            onPressOut={() => animatePress(false)}
          >
            <Text style={styles.homeButtonText}>BACK TO HOME</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingTop: 55,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 55,
  },

  questionCard: {
    backgroundColor: "#17233A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#263653",
  },

  questionNumber: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 18,
    lineHeight: 26,
  },

  option: {
    backgroundColor: "#263653",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  correctOption: {
    backgroundColor: "#1f7a3f",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  wrongOption: {
    backgroundColor: "#9b2c2c",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
  },

  correctText: {
    color: "#4ade80",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 3,
  },

  incorrectText: {
    color: "#f87171",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 3,
  },

  homeButton: {
    height: 56,
    backgroundColor: "#17233A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
