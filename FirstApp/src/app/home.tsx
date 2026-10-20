import { clearSession } from "@/lib/auth";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const startScale = useRef(new Animated.Value(1)).current;
  const historyScale = useRef(new Animated.Value(1)).current;
  const deviceScale = useRef(new Animated.Value(1)).current;
  const [loggingOut, setLoggingOut] = useState(false);

  const animatePress = (scale: Animated.Value, pressed: boolean) => {
    Animated.spring(scale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await clearSession();
            router.replace("/login");
          } catch {
            setLoggingOut(false);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS QUIZ</Text>
        <View style={styles.titleLine} />
        <Text style={styles.subtitle}>
          Test your Operating Systems knowledge
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: startScale }] }}>
          <Pressable
            style={styles.startButton}
            onPress={() => router.push("/quizInit")}
            onPressIn={() => animatePress(startScale, true)}
            onPressOut={() => animatePress(startScale, false)}
          >
            <Text style={styles.startButtonText}>START QUIZ</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: historyScale }] }}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/history")}
            onPressIn={() => animatePress(historyScale, true)}
            onPressOut={() => animatePress(historyScale, false)}
          >
            <Text style={styles.secondaryButtonText}>QUIZ HISTORY</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: deviceScale }] }}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/device")}
            onPressIn={() => animatePress(deviceScale, true)}
            onPressOut={() => animatePress(deviceScale, false)}
          >
            <Text style={styles.secondaryButtonText}>DEVICE INFO</Text>
          </Pressable>
        </Animated.View>

        <Pressable
          style={[styles.logoutButton, loggingOut && { opacity: 0.5 }]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutButtonText}>
            {loggingOut ? "LOGGING OUT..." : "LOG OUT"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>OPERATING SYSTEMS • QUIZ APP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingTop: 120,
    paddingBottom: 35,
  },
  header: {
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  titleLine: {
    width: 55,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
    marginTop: 12,
  },
  subtitle: {
    color: "#A8B3C7",
    fontSize: 15,
    textAlign: "center",
    marginTop: 14,
  },
  buttonContainer: {
    width: "100%",
    gap: 14,
  },
  startButton: {
    height: 62,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 24,
    marginLeft: 12,
    marginTop: -2,
  },
  secondaryButton: {
    height: 56,
    backgroundColor: "#17233A",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#263653",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
  },
  logoutButton: {
    height: 52,
    backgroundColor: "#2A1925",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#713047",
  },
  logoutButtonText: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    color: "#52617A",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 1,
  },
});
