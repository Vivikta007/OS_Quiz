import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function PausedScreen() {
  const resumeScale = useRef(new Animated.Value(1)).current;

  const animatePress = (pressed: boolean) => {
    Animated.spring(resumeScale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.pauseBox}>
        <Text style={styles.title}>Quiz Paused</Text>

        <View style={styles.line} />

        <Text style={styles.message}>
          The quiz was paused because you left the app.
        </Text>

        <Animated.View style={{ transform: [{ scale: resumeScale }] }}>
          <Pressable
            style={styles.button}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            onPressIn={() => animatePress(true)}
            onPressOut={() => animatePress(false)}
          >
            <Text style={styles.buttonText}>RESUME QUIZ</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 32, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  pauseBox: {
    backgroundColor: "#17233A",
    padding: 28,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#263653",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },

  line: {
    width: 45,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
    marginBottom: 18,
  },

  message: {
    color: "#A8B3C7",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 25,
  },

  button: {
    height: 54,
    backgroundColor: "#3B82F6",
    borderRadius: 13,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },
});
