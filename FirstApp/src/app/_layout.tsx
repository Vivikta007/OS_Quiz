import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SessionProvider, useSession } from "@/lib/session";

SplashScreen.preventAutoHideAsync();

const BACKGROUND = "#0B1220";

// The native view *behind* every screen is white by default. It shows through
// while a screen slides away (e.g. pressing Back), so make it dark too.
SystemUI.setBackgroundColorAsync(BACKGROUND);

// The app is always dark. Using the same background for the navigator means
// no white flash shows behind screens while they slide in and out.
const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: BACKGROUND,
    card: BACKGROUND,
  },
};

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { isLoggedIn, isChecking } = useSession();

  // Keep the native splash screen up (preventAutoHideAsync above) until we
  // know where to send the user. The overlay below hides it once mounted.
  if (isChecking) {
    return null;
  }

  return (
    <ThemeProvider value={appTheme}>
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BACKGROUND },
          // One consistent transition: new screens slide in from the right,
          // Back slides them out to the right.
          animation: "slide_from_right",
          // router.replace() moves *forward* (e.g. quiz -> score), so animate
          // it like opening a screen, not like going back.
          animationTypeForReplace: "push",
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />

        {/* Only reachable when logged OUT. Logging in makes these
            unreachable, so Expo Router moves the user on to /home. */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" options={{ animation: "fade" }} />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack.Protected>

        {/* Only reachable when logged IN. Logging out (or an expired
            session) removes these screens and goes back to /login. */}
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="home" options={{ animation: "fade" }} />
          <Stack.Screen name="quizInit" />
          {/* No swipe-back out of a running quiz - it has its own exit dialog */}
          <Stack.Screen name="quiz" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="score"
            options={{ animation: "fade", gestureEnabled: false }}
          />
          <Stack.Screen name="review" />
          <Stack.Screen name="history" />
          <Stack.Screen name="performance" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="device" />
          {/* Admin screens - the backend refuses non-admins on every call */}
          <Stack.Screen name="admin" />
          <Stack.Screen name="admin-generate" />
          <Stack.Screen name="admin-question" />
          <Stack.Screen
            name="paused"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              gestureEnabled: false,
            }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
