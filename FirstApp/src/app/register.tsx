import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AuthHeader, LinkRow } from "@/ui/Auth";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { TextField } from "@/ui/TextField";
import { spacing } from "@/ui/theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showAlert("Missing details", "Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showAlert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showAlert(
        "Weak password",
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Password mismatch", "Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/register", {
        method: "POST",
        body: {
          full_name: name.trim(),
          email: email.trim(),
          password,
        },
      });

      if (data.email_confirmation_required) {
        showAlert(
          "Account created",
          "Your account was created successfully. Please confirm your email if requested, then log in.",
          [
            {
              text: "Continue to Login",
              onPress: () => goBack("/login"),
            },
          ],
        );
      } else {
        showAlert(
          "Registration successful",
          "Your account has been created. You can now log in.",
          [
            {
              text: "Continue to Login",
              onPress: () => goBack("/login"),
            },
          ],
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      showAlert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={styles.content}>
        <AuthHeader subtitle="Create your account to get started" />

        <View style={styles.form}>
          <TextField
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            maxLength={80}
            editable={!loading}
          />

          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!loading}
          />

          <TextField
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="new-password"
            editable={!loading}
          />

          <TextField
            label="Confirm password"
            placeholder="Enter it again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            password
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={handleRegister}
            editable={!loading}
          />

          <Button
            title="Create account"
            loading={loading}
            onPress={handleRegister}
            style={styles.submit}
          />

          <LinkRow
            text="Already have an account?"
            link="Log in"
            onPress={() => goBack("/login")}
            disabled={loading}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
