import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/auth";

const API_PORT = 8000;
const REQUEST_TIMEOUT_MS = 10000;

// Works out where the backend is:
// - EXPO_PUBLIC_API_URL in .env always wins
// - web: the same machine the browser page came from
// - Expo Go: the computer running the Expo dev server
export function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:${API_PORT}`;
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0];

  return `http://${host ?? "127.0.0.1"}:${API_PORT}`;
}

// An error that came back from our backend, with its HTTP status code.
// status 0 means the server couldn't be reached at all.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  // true = this endpoint needs the user to be logged in
  auth?: boolean;
  // How long to wait for slow endpoints (e.g. AI question generation)
  timeoutMs?: number;
};

// One HTTP request. No login or retry logic here.
async function send(
  path: string,
  method: string,
  body: unknown,
  accessToken: string | null,
  timeoutMs = REQUEST_TIMEOUT_MS,
) {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Give up if the server doesn't answer in time, instead of spinning forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${getApiUrl()}. Make sure the backend is running.`,
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // FastAPI puts its error message in "detail"
    const detail =
      typeof data.detail === "string" ? data.detail : "Request failed.";
    throw new ApiError(detail, response.status);
  }

  return data;
}

// If several requests fail with 401 at the same moment, they all wait for
// this one refresh. Supabase refresh tokens work only once, so refreshing
// twice in parallel would log the user out.
let refreshInProgress: Promise<string | null> | null = null;

// Swap the refresh token for a new access token.
// Returns null if the session is truly over (the user must log in again).
function refreshAccessToken() {
  if (!refreshInProgress) {
    refreshInProgress = (async () => {
      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          return null;
        }

        const data = await send("/refresh", "POST", {
          refresh_token: refreshToken,
        }, null);

        await saveTokens(data.access_token, data.refresh_token);

        return data.access_token as string;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        // Server unreachable etc. - don't log the user out for that.
        throw error;
      } finally {
        refreshInProgress = null;
      }
    })();
  }

  return refreshInProgress;
}

// Clearing the session tells _layout.tsx the user is logged out, and its
// Stack.Protected guard moves them to the login screen.
async function endSession() {
  await clearSession();
}

// Call our backend. For protected endpoints pass { auth: true }:
// the access token is attached, and if it has expired we refresh it
// and retry exactly once (no infinite loops).
export async function apiRequest(path: string, options: RequestOptions = {}) {
  const { method = "GET", body, auth = false, timeoutMs } = options;

  if (!auth) {
    return send(path, method, body, null, timeoutMs);
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    await endSession();
    throw new ApiError("Please log in again.", 401);
  }

  try {
    return await send(path, method, body, accessToken, timeoutMs);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  // The access token was rejected (probably expired) - refresh and retry once.
  const newAccessToken = await refreshAccessToken();

  if (!newAccessToken) {
    await endSession();
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  return send(path, method, body, newAccessToken, timeoutMs);
}
