import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// persistent data
// learnt sandboxing and private data isolation
// App lifecycle and state management

// access the data from AsyncStorage and display it in a list
// using await because the memory access is asynchronous and we need to
// wait for it to complete before we can use the data

// The OS can move/manage applications through states such as
// foreground/background and eventually termination.

type AnswerRecord = {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
};

type QuizResult = {
  score: number;
  total: number;
  date: string;
  answers: AnswerRecord[];
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<QuizResult[]>([]);

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const savedHistory = await AsyncStorage.getItem("quizHistory");

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setHistory([...parsedHistory].reverse());
    }
  };

  const animatePress = (pressed: boolean) => {
    Animated.spring(buttonScale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz History</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>No quiz attempts yet.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.historyItem}
              onPress={() =>
                router.push({
                  pathname: "/review",
                  params: {
                    answers: JSON.stringify(item.answers),
                  },
                })
              }
            >
              <Text style={styles.score}>
                {item.score} / {item.total}
              </Text>

              <Text style={styles.date}>
                {new Date(item.date).toLocaleString()}
              </Text>

              <Text style={styles.reviewText}>TAP TO REVIEW</Text>
            </Pressable>
          )}
        />
      )}

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          style={styles.button}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/quiz");
            }
          }}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
        >
          <Text style={styles.buttonText}>BACK</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 55,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 25,
    textAlign: "center",
  },

  emptyText: {
    color: "#A8B3C7",
    fontSize: 17,
    textAlign: "center",
    marginTop: 30,
  },

  list: {
    paddingBottom: 10,
  },

  historyItem: {
    backgroundColor: "#17233A",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#263653",
  },

  score: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  date: {
    color: "#A8B3C7",
    fontSize: 14,
    marginTop: 6,
  },

  reviewText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 12,
  },

  button: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
