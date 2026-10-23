import { View } from "react-native";

import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { radius, spacing } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

// Shown over the quiz (transparentModal) when the user leaves the app
// mid-quiz. Resuming just closes this overlay.
export default function PausedScreen() {
  const styles = useStyles();
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <AppText variant="title" center>
          Quiz paused
        </AppText>
        <AppText variant="small" tone="secondary" center style={styles.message}>
          The quiz was paused because you left the app. Your answers so far
          are safe.
        </AppText>

        <Button
          title="Resume quiz"
          onPress={() => goBack()}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg + 4,
    backgroundColor: colors.surface,
  },
  message: {
    marginBottom: spacing.sm,
  },
  button: {
    alignSelf: "stretch",
  },
}));
