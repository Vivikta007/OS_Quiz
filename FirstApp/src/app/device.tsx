// downloaded "npx expo install expo-device" in terminal
// to use the expo-device package

import * as Device from "expo-device";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function DeviceScreen() {
  const buttonScale = useRef(new Animated.Value(1)).current;

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
      <Text style={styles.title}>Device Information</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Device:</Text>
        <Text style={styles.value}>{Device.deviceName ?? "Unknown"}</Text>

        <Text style={styles.label}>OS:</Text>
        <Text style={styles.value}>{Device.osName ?? "Unknown"}</Text>

        <Text style={styles.label}>OS Version:</Text>
        <Text style={styles.value}>{Device.osVersion ?? "Unknown"}</Text>

        <Text style={styles.label}>Device Type:</Text>
        <Text style={styles.value}>
          {Device.deviceType === Device.DeviceType.PHONE
            ? "Phone"
            : Device.deviceType === Device.DeviceType.TABLET
              ? "Tablet"
              : "Other"}
        </Text>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/")}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
        >
          <Text style={styles.buttonText}>BACK TO HOME</Text>
        </Pressable>
      </Animated.View>
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
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  infoBox: {
    backgroundColor: "#17233A",
    padding: 22,
    borderRadius: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#263653",
  },

  label: {
    color: "#A8B3C7",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 19,
    marginTop: 4,
  },

  button: {
    height: 56,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
