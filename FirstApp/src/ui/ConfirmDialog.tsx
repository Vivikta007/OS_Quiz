import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { radius, spacing } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean; // red confirm button, e.g. "End quiz"
  onConfirm: () => void;
  onCancel: () => void;
};

// A centred confirmation pop-up that matches the app (system alerts don't).
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const styles = useStyles();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Tapping outside the card cancels */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={styles.card}>
          <AppText variant="heading" center>
            {title}
          </AppText>
          <AppText variant="small" tone="secondary" center style={styles.message}>
            {message}
          </AppText>

          <View style={styles.buttons}>
            <Button
              title={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              title={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = createStyles((colors) => ({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 4,
    padding: spacing.xl,
    alignItems: "center",
  },
  message: {
    marginTop: spacing.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    alignSelf: "stretch",
  },
  button: {
    flex: 1,
  },
}));
