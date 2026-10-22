import { Alert, AlertButton, Platform } from "react-native";

// Alert.alert does nothing on web, so use the browser's alert/confirm there.
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;
  const cancelButton = buttons?.find((button) => button.style === "cancel");
  const actionButton = buttons?.find((button) => button.style !== "cancel");

  if (cancelButton && actionButton) {
    if (window.confirm(text)) {
      actionButton.onPress?.();
    } else {
      cancelButton.onPress?.();
    }
    return;
  }

  window.alert(text);
  actionButton?.onPress?.();
}
