import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const allTopics = [
  "OS Basics",
  "CPU Scheduling",
  "Process Synchronization",
  "Deadlocks",
  "Memory Management",
  "File Systems",
  "Processes & System Calls",
  "OS Interface",
];

const difficulties = ["Easy", "Medium", "Hard", "Adaptive"];

export default function QuizInitScreen() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );

  const [questionCount, setQuestionCount] = useState<number>(10);

  const toggleTopic = (topic: string) => {
    if (topic === "Mixed Topics") {
      setSelectedTopics(
        selectedTopics.length === allTopics.length ? [] : allTopics,
      );
      return;
    }

    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const startQuiz = () => {
    if (selectedTopics.length === 0 || !selectedDifficulty) {
      return;
    }

    router.push({
      pathname: "/quiz",
      params: {
        topics: JSON.stringify(selectedTopics),
        difficulty: selectedDifficulty,
        questionCount: questionCount.toString(),
      },
    });
  };

  const mixedSelected = selectedTopics.length === allTopics.length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>QUIZ SETUP</Text>

        <Text style={styles.subtitle}>Choose what you want to practice</Text>

        {/* TOPICS */}
        <Text style={styles.sectionTitle}>QUESTION TOPICS</Text>

        <Pressable
          style={[styles.option, mixedSelected && styles.selectedOption]}
          onPress={() => toggleTopic("Mixed Topics")}
        >
          <View
            style={[styles.checkbox, mixedSelected && styles.selectedCheckbox]}
          >
            {mixedSelected && <Text style={styles.check}>✓</Text>}
          </View>

          <Text
            style={[styles.optionText, mixedSelected && styles.selectedText]}
          >
            Mixed Topics
          </Text>
        </Pressable>

        {allTopics.map((topic) => {
          const selected = selectedTopics.includes(topic);

          return (
            <Pressable
              key={topic}
              style={[styles.option, selected && styles.selectedOption]}
              onPress={() => toggleTopic(topic)}
            >
              <View
                style={[styles.checkbox, selected && styles.selectedCheckbox]}
              >
                {selected && <Text style={styles.check}>✓</Text>}
              </View>

              <Text
                style={[styles.optionText, selected && styles.selectedText]}
              >
                {topic}
              </Text>
            </Pressable>
          );
        })}

        {/* DIFFICULTY */}
        <Text style={[styles.sectionTitle, styles.difficultyTitle]}>
          DIFFICULTY
        </Text>

        {difficulties.map((difficulty) => {
          const selected = selectedDifficulty === difficulty;

          return (
            <Pressable
              key={difficulty}
              style={[styles.option, selected && styles.selectedOption]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <View style={[styles.radio, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioDot} />}
              </View>

              <Text
                style={[styles.optionText, selected && styles.selectedText]}
              >
                {difficulty}
              </Text>

              {difficulty === "Adaptive" && (
                <Text style={styles.aiText}>AI</Text>
              )}
            </Pressable>
          );
        })}

        {/* NUMBER OF QUESTIONS */}
        <Text style={[styles.sectionTitle, styles.difficultyTitle]}>
          NUMBER OF QUESTIONS
        </Text>

        <View style={styles.countContainer}>
          {[5, 10, 15, 20].map((count) => {
            const selected = questionCount === count;

            return (
              <Pressable
                key={count}
                style={[styles.countOption, selected && styles.selectedCount]}
                onPress={() => setQuestionCount(count)}
              >
                <Text
                  style={[
                    styles.countText,
                    selected && styles.selectedCountText,
                  ]}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* START */}
        <Pressable
          style={[
            styles.startButton,
            (selectedTopics.length === 0 || !selectedDifficulty) &&
              styles.disabledButton,
          ]}
          disabled={selectedTopics.length === 0 || !selectedDifficulty}
          onPress={startQuiz}
        >
          <Text style={styles.startButtonText}>START QUIZ</Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },

  subtitle: {
    color: "#A8B3C7",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 35,
  },

  sectionTitle: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  option: {
    minHeight: 58,
    backgroundColor: "#17233A",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedOption: {
    borderColor: "#3B82F6",
    backgroundColor: "#1B2D4A",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#53627A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  selectedCheckbox: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },

  selectedText: {
    fontWeight: "600",
  },

  difficultyTitle: {
    marginTop: 25,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#53627A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  selectedRadio: {
    borderColor: "#3B82F6",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },

  aiText: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  /* NUMBER OF QUESTIONS */

  countContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 5,
  },

  countOption: {
    flex: 1,
    height: 52,
    backgroundColor: "#17233A",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCount: {
    backgroundColor: "#1B2D4A",
    borderColor: "#3B82F6",
  },

  countText: {
    color: "#A8B3C7",
    fontSize: 16,
    fontWeight: "600",
  },

  selectedCountText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  startButton: {
    height: 58,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.4,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  backButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263653",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  backButtonText: {
    color: "#A8B3C7",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
