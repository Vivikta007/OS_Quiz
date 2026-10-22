import { Redirect } from "expo-router";

import { useSession } from "@/lib/session";

// The app's entry point: send the user straight to the right first screen.
export default function Index() {
  const { isLoggedIn } = useSession();

  return <Redirect href={isLoggedIn ? "/home" : "/login"} />;
}
