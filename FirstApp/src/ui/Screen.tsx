import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, spacing } from "@/ui/theme";

type Props = {
  children: ReactNode;
  header?: ReactNode; // stays at the top (e.g. <Header />)
  footer?: ReactNode; // stays at the bottom (e.g. the main button)
  scroll?: boolean; // let the content scroll
  keyboard?: boolean; // move content up when the keyboard opens
  // Pull down to reload (needs scroll). `refreshing` shows the spinner.
  onRefresh?: () => void;
  refreshing?: boolean;
};

// Every screen's outer layout. SafeAreaView keeps content clear of the
// notch, camera hole and home indicator on every phone, instead of guessing
// with a fixed paddingTop.
export function Screen({
  children,
  header,
  footer,
  scroll = false,
  keyboard = false,
  onRefresh,
  refreshing = false,
}: Props) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh && (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        )
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content]}>{children}</View>
  );

  const inner = (
    <>
      {header}
      {body}
      {footer && <View style={styles.footer}>{footer}</View>}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1, // lets a centred empty/error state fill the screen
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
