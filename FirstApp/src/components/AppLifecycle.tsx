import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

//used Appstates aka AppLifecycle

//Background → Active → Background → Active (pause feature using a trasperent stack model)

export default function AppLifecycle() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const pathname = usePathname();

  useEffect(() => {
    console.log("Current app state:", appState.current);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const previousState = appState.current;

      console.log("App state changed:", previousState, "→", nextAppState);

      if (
        previousState === "background" &&
        nextAppState === "active" &&
        pathname === "/quiz"
      ) {
        console.log("Quiz resumed → opening pause screen");
        router.push("/paused");
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [pathname]);

  return null;
}
