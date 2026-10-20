import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://172.20.165.150:8000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed. Please try again.");
      }

      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("refresh_token", data.refresh_token);
      await SecureStore.setItemAsync("user_id", data.user_id);
      await SecureStore.setItemAsync("user_email", data.email);

      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>OS QUIZ</Text>
          <View style={styles.titleLine} />
          <Text style={styles.subtitle}>Sign in to continue learning</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!loading}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            editable={!loading}
          />

          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>LOG IN</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push("/register")}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Register</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>OPERATING SYSTEMS • QUIZ APP</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 25,
    paddingTop: 70,
    paddingBottom: 30,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 45,
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
  form: {
    width: "100%",
    gap: 12,
  },
  label: {
    color: "#A8B3C7",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 8,
  },
  input: {
    height: 54,
    backgroundColor: "#17233A",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },
  loginButton: {
    height: 60,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 24,
    marginLeft: 12,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },
  registerText: {
    color: "#A8B3C7",
    fontSize: 14,
  },
  registerLink: {
    color: "#60A5FA",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    color: "#52617A",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 1,
  },
});
