import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ApiError, apiRequest } from "@/lib/api";
import { getAccessToken, onSessionChange } from "@/lib/auth";

// Shares "is the user logged in?" with the whole app. _layout.tsx uses it to
// decide which screens are reachable (Stack.Protected), so logging in or out
// is just a state change - Expo Router does the navigation.

type SessionState = {
  isLoggedIn: boolean;
  isChecking: boolean; // true while we check the saved session on startup
};

const SessionContext = createContext<SessionState>({
  isLoggedIn: false,
  isChecking: true,
});

// A saved token isn't proof the user is still logged in - it may have expired
// or been revoked - so ask the server. apiRequest refreshes an expired token,
// or clears the session if it can't be refreshed.
async function checkSavedSession() {
  if (!(await getAccessToken())) {
    return false;
  }

  try {
    await apiRequest("/me", { auth: true });
    return true;
  } catch (error) {
    // Server unreachable: keep the saved session so the app still opens.
    return !(error instanceof ApiError && error.status === 401);
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // saveSession() / clearSession() in auth.ts call this
    const unsubscribe = onSessionChange(setIsLoggedIn);

    checkSavedSession()
      .then(setIsLoggedIn)
      .finally(() => setIsChecking(false));

    return unsubscribe;
  }, []);

  return (
    <SessionContext.Provider value={{ isLoggedIn, isChecking }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
