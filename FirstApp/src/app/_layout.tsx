import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  router,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppLifecycle from "@/components/AppLifecycle";
import { getAccessToken } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        await getAccessToken();
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (checkingSession) return;

    let active = true;

    async function guardRoute() {
      try {
        const token = await getAccessToken();

        if (!active) return;

        const currentScreen = segments[0];
        const isAuthScreen =
          currentScreen === "login" || currentScreen === "register";

        if (token && isAuthScreen) {
          router.replace("/home");
        } else if (!token && !isAuthScreen) {
          router.replace("/login");
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      }
    }

    guardRoute();

    return () => {
      active = false;
    };
  }, [checkingSession, segments]);

  if (checkingSession) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppLifecycle />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="paused"
          options={{ presentation: "transparentModal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
