import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { colors, radius, spacing } from "@/ui/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  visible: boolean;
  icon?: IconName;
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
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: Props) {
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
          {icon && (
            <View
              style={[
                styles.iconCircle,
                destructive && { backgroundColor: colors.dangerSoft },
              ]}
            >
              <Ionicons
                name={icon}
                size={26}
                color={destructive ? colors.danger : colors.accentText}
              />
            </View>
          )}

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
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
});
