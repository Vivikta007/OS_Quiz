import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { AppText } from "@/ui/AppText";
import { AuthHeader, LinkRow } from "@/ui/Auth";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { TextField } from "@/ui/TextField";
import { colors, layout, spacing } from "@/ui/theme";

// Hidden until custom SMTP is set up in Supabase: the built-in email
// sender only reaches the project's team, and its Reset Password template
// (which must contain {{ .Token }}) can't be edited without custom SMTP.
// The screen and backend endpoints are ready - flip this to turn it on.
const SHOW_FORGOT_PASSWORD = false;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert("Missing details", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/login", {
        method: "POST",
        body: {
          email: email.trim(),
          password,
        },
      });

      await saveSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user_id: data.user_id,
        user_email: data.email,
      });

      // Saving the session marks the user as logged in, and the layout's
      // Stack.Protected guard moves them on to /home - no navigation needed.
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      showAlert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={styles.content}>
        <AuthHeader subtitle="Sign in to continue learning" />

        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            editable={!loading}
          />

          <TextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            editable={!loading}
          />

          {SHOW_FORGOT_PASSWORD && (
            <Pressable
              accessibilityRole="link"
              hitSlop={layout.hitSlop}
              style={styles.forgot}
              onPress={() => router.push("/forgot-password")}
              disabled={loading}
            >
              <AppText variant="small" style={styles.forgotText}>
                Forgot password?
              </AppText>
            </Pressable>
          )}

          <Button
            title="Log in"
            trailingIcon="arrow-forward"
            loading={loading}
            onPress={handleLogin}
            style={styles.submit}
          />

          <LinkRow
            text="Don't have an account?"
            link="Register"
            onPress={() => router.push("/register")}
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
  forgot: {
    alignSelf: "flex-end",
    marginTop: -spacing.xs,
  },
  forgotText: {
    color: colors.accentText,
    fontWeight: "600",
  },
  submit: {
    marginTop: spacing.sm,
  },
});
