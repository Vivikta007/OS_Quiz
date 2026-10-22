import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { AppText } from "@/ui/AppText";
import { colors, layout, radius, spacing, typography } from "@/ui/theme";

type Props = TextInputProps & {
  label: string;
  // Hides the text and adds an eye button to show it
  password?: boolean;
};

// A labelled text input. The border lights up while typing, and password
// fields get a show/hide button.
export function TextField({ label, password, style, multiline, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <AppText variant="label" tone="secondary">
        {label}
      </AppText>
      <View
        style={[
          styles.box,
          multiline && styles.multilineBox,
          focused && styles.focused,
          rest.editable === false && styles.disabled,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && hidden}
          multiline={multiline}
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={layout.hitSlop}
            onPress={() => setHidden((current) => !current)}
            style={styles.eye}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.buttonHeight,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  multilineBox: {
    alignItems: "flex-start",
  },
  focused: {
    borderColor: colors.accent,
  },
  disabled: {
    opacity: 0.6,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  eye: {
    paddingHorizontal: spacing.md,
    alignSelf: "stretch",
    justifyContent: "center",
  },
});
