import * as SecureStore from "expo-secure-store";

export async function getAccessToken() {
  return await SecureStore.getItemAsync("access_token");
}

export async function clearSession() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("user_id");
  await SecureStore.deleteItemAsync("user_email");
}
