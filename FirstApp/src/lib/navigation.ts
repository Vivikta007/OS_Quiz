import { type Href, router } from "expo-router";

// Go back to the previous screen (with the normal "back" animation).
// If there is nothing to go back to - e.g. the app was opened on this
// screen - go to the fallback screen instead.
export function goBack(fallback: Href = "/home") {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}

// Return to the Home screen that's already open underneath, closing every
// screen above it with one "back" animation. (Pushing or replacing "/home"
// would stack a second Home screen instead.)
export function goHome() {
  router.dismissTo("/home");
}
