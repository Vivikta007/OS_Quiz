import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Phones: SecureStore keeps tokens in the encrypted Keychain/Keystore.
// Web: SecureStore doesn't exist, so AsyncStorage uses the browser's
// localStorage. That is NOT secure storage - any script running on the
// page can read it. It's fine for local testing; a production web app
// would keep the refresh token in an httpOnly cookie instead.

async function getItem(key: string) {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(key);
  }

  return await SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function getAccessToken() {
  return await getItem("access_token");
}

export async function getRefreshToken() {
  return await getItem("refresh_token");
}

// After a refresh only the tokens change; the user stays the same.
export async function saveTokens(accessToken: string, refreshToken: string) {
  await setItem("access_token", accessToken);
  await setItem("refresh_token", refreshToken);
}

// Screens can listen for log in / log out (see src/lib/session.tsx).
type SessionListener = (loggedIn: boolean) => void;
const sessionListeners = new Set<SessionListener>();

export function onSessionChange(listener: SessionListener) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function notifySessionChange(loggedIn: boolean) {
  sessionListeners.forEach((listener) => listener(loggedIn));
}

export async function clearSession() {
  await removeItem("access_token");
  await removeItem("refresh_token");
  await removeItem("user_id");
  await removeItem("user_email");
  notifySessionChange(false);
}

export async function saveSession(session: {
  access_token: string;
  refresh_token: string;
  user_id: string;
  user_email: string;
}) {
  for (const [key, value] of Object.entries(session)) {
    await setItem(key, value);
  }

  notifySessionChange(true);
}
