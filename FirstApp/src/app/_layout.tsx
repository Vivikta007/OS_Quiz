import {
  SchibstedGrotesk_400Regular,
  SchibstedGrotesk_500Medium,
  SchibstedGrotesk_600SemiBold,
  SchibstedGrotesk_700Bold,
} from "@expo-google-fonts/schibsted-grotesk";
import { useFonts } from "expo-font";
import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SessionProvider, useSession } from "@/lib/session";
import { colors } from "@/ui/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { isLoggedIn, isChecking } = useSession();

  // The native view *behind* every screen is white by default. It shows
  // through while a screen slides away (e.g. pressing Back), so match it
  // to the app.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, []);

  // The navigator uses the same background, so no flash shows behind
  // screens while they slide in and out.
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.background,
      primary: colors.accent,
      text: colors.text,
      border: colors.border,
    },
  };
  // The app's fonts (names match `fonts` in ui/theme.ts)
  const [fontsLoaded, fontError] = useFonts({
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_500Medium,
    SchibstedGrotesk_600SemiBold,
    SchibstedGrotesk_700Bold,
  });

  // Keep the native splash screen up (preventAutoHideAsync above) until we
  // know where to send the user and the fonts are ready. The overlay below
  // hides it once mounted. If a font fails to load, carry on with the
  // system font rather than getting stuck on the splash.
  if (isChecking || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          // One consistent transition: new screens slide in from the right,
          // Back slides them out to the right.
          animation: "slide_from_right",
          // router.replace() moves *forward* (e.g. quiz -> score), so animate
          // it like opening a screen, not like going back.
          animationTypeForReplace: "push",
          // A little quicker than the platform default
          animationDuration: 250,
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
          <Stack.Screen name="history" options={{ animation: "fade" }} />
          <Stack.Screen name="performance" options={{ animation: "fade" }} />
          <Stack.Screen name="profile" options={{ animation: "fade" }} />
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
    </NavigationThemeProvider>
  );
}
