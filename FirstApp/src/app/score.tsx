import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function ScoreScreen() {
  const { score, total, answers, topics, difficulty } = useLocalSearchParams();

  const restartScale = useRef(new Animated.Value(1)).current;
  const reviewScale = useRef(new Animated.Value(1)).current;
  const homeScale = useRef(new Animated.Value(1)).current;

  const animatePress = (scale: Animated.Value, pressed: boolean) => {
    Animated.spring(scale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quiz Completed!</Text>

        <Text style={styles.scoreLabel}>YOUR SCORE</Text>

        <Text style={styles.number}>
          {score} / {total}
        </Text>

        <View style={styles.scoreLine} />
      </View>

      <View style={styles.buttons}>
        {/* RESTART QUIZ */}
        <Animated.View style={{ transform: [{ scale: restartScale }] }}>
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.replace({
                pathname: "/quiz",
                params: {
                  topics,
                  difficulty,
                },
              })
            }
            onPressIn={() => animatePress(restartScale, true)}
            onPressOut={() => animatePress(restartScale, false)}
          >
            <Text style={styles.primaryButtonText}>RESTART QUIZ</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </Animated.View>

        {/* REVIEW ANSWERS */}
        <Animated.View style={{ transform: [{ scale: reviewScale }] }}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({
                pathname: "/review",
                params: {
                  answers,
                },
              })
            }
            onPressIn={() => animatePress(reviewScale, true)}
            onPressOut={() => animatePress(reviewScale, false)}
          >
            <Text style={styles.secondaryButtonText}>REVIEW ANSWERS</Text>
          </Pressable>
        </Animated.View>

        {/* BACK TO HOME */}
        <Animated.View style={{ transform: [{ scale: homeScale }] }}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/")}
            onPressIn={() => animatePress(homeScale, true)}
            onPressOut={() => animatePress(homeScale, false)}
          >
            <Text style={styles.secondaryButtonText}>BACK TO HOME</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 25,
    paddingTop: 90,
    paddingBottom: 55,
    justifyContent: "space-between",
  },

  content: {
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 55,
  },

  scoreLabel: {
    color: "#A8B3C7",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 12,
  },

  number: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "bold",
  },

  scoreLine: {
    width: 55,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
    marginTop: 18,
  },

  buttons: {
    width: "100%",
    gap: 14,
  },

  primaryButton: {
    height: 60,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 23,
    marginLeft: 12,
    marginTop: -2,
  },

  secondaryButton: {
    height: 55,
    backgroundColor: "#17233A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263653",
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
