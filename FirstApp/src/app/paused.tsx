import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { colors, radius, spacing } from "@/ui/theme";

// Shown over the quiz (transparentModal) when the user leaves the app
// mid-quiz. Resuming just closes this overlay.
export default function PausedScreen() {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="pause" size={28} color={colors.accentText} />
        </View>

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

const styles = StyleSheet.create({
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
  },
  message: {
    marginBottom: spacing.sm,
  },
  button: {
    alignSelf: "stretch",
  },
});
