import * as Haptics from "expo-haptics";

// Small vibrations that make taps feel physical. They're a nice extra, so a
// device without a vibration motor (or a browser that blocks it) is ignored.

function safely(run: () => Promise<void>) {
  run().catch(() => {});
}

// Pressing a button
export function tapHaptic() {
  safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// Choosing an option (answer, chip, segment)
export function selectHaptic() {
  safely(() => Haptics.selectionAsync());
}

// Something finished well (quiz submitted, profile saved)
export function successHaptic() {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// A warning (e.g. confirm leaving a quiz)
export function warningHaptic() {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
