import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AuthHeader, LinkRow } from "@/ui/Auth";
import { Button } from "@/ui/Button";
import { Reveal } from "@/ui/Reveal";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { TextField } from "@/ui/TextField";
import { spacing } from "@/ui/theme";

// Two steps on one screen:
// 1. "email" - the user enters their email and we send them a reset code
// 2. "reset" - they enter that code and choose a new password
type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showAlert("Invalid email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });

      setStep("reset");
      showAlert(
        "Check your email",
        "If an account exists for this email, we've sent it a reset code.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      showAlert("Could not send code", message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!/^\d{6,10}$/.test(code.trim())) {
      showAlert("Invalid code", "Enter the code from the email (digits only).");
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

      await apiRequest("/reset-password", {
        method: "POST",
        body: {
          email: email.trim(),
          code: code.trim(),
          new_password: password,
        },
      });

      showAlert("Password changed", "You can now log in with your new password.", [
        {
          text: "Continue to Login",
          onPress: () => goBack("/login"),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      showAlert("Reset failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard header={<Header onBack={() => goBack("/login")} />}>
      <View style={styles.content}>
        <AuthHeader
          subtitle={
            step === "email"
              ? "Enter your email and we'll send you a reset code"
              : `Enter the code sent to ${email.trim()} and choose a new password`
          }
        />

        <Reveal order={3} style={styles.form}>
          {step === "email" ? (
            <>
              <TextField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="send"
                onSubmitEditing={sendCode}
                editable={!loading}
              />

              <Button
                title="Send code"
                loading={loading}
                onPress={sendCode}
                style={styles.submit}
              />
            </>
          ) : (
            <>
              <TextField
                label="Reset code"
                placeholder="Code from the email"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={10}
                editable={!loading}
              />

              <TextField
                label="New password"
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
                onSubmitEditing={resetPassword}
                editable={!loading}
              />

              <Button
                title="Reset password"
                loading={loading}
                onPress={resetPassword}
                style={styles.submit}
              />

              <LinkRow
                text="Didn't get a code?"
                link="Send again"
                onPress={sendCode}
                disabled={loading}
              />
            </>
          )}

          <LinkRow
            text="Remembered it?"
            link="Log in"
            onPress={() => goBack("/login")}
            disabled={loading}
          />
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
