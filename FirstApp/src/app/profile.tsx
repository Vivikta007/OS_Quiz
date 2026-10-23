import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { successHaptic, tapHaptic } from "@/ui/haptics";
import { Bullet, initials } from "@/ui/Brand";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { TabBar } from "@/ui/TabBar";
import { StateView } from "@/ui/StateView";
import { TextField } from "@/ui/TextField";
import { radius, spacing } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Shows the logged-in user's profile (GET /me) and lets them change
// their name (PATCH /profile). Email can't be changed here - Supabase Auth
// owns it and changing it needs email confirmation.

type Profile = {
  user_id: string;
  email: string;
  full_name: string | null;
  profile_created_at: string | null;
  is_admin: boolean;
};

export default function ProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const loadProfile = () =>
    apiRequest("/me", { auth: true })
      .then((me: Profile) => {
        setProfile(me);
        setName(me.full_name ?? "");
      })
      .catch((error) => {
        setLoadError(
          error instanceof Error ? error.message : "Could not load your profile.",
        );
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    loadProfile();
  }, []);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    loadProfile();
  };

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== (profile?.full_name ?? "");
  const canSave = !saving && trimmedName.length > 0 && nameChanged;

  const saveProfile = async () => {
    if (!canSave) return;

    setSaving(true);
    setSavedMessage(false);

    try {
      const updated: Profile = await apiRequest("/profile", {
        method: "PATCH",
        auth: true,
        body: { full_name: trimmedName },
      });
      setProfile(updated);
      setName(updated.full_name ?? "");
      setSavedMessage(true);
      successHaptic();
    } catch (error) {
      showAlert(
        "Could not save",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen header={<Header title="Profile" hideBack />} tabBar={<TabBar active="profile" />}>
        <StateView loading />
      </Screen>
    );
  }

  if (loadError || !profile) {
    return (
      <Screen header={<Header title="Profile" hideBack />} tabBar={<TabBar active="profile" />}>
        <StateView
          tone="danger"
          title="Couldn't load your profile"
          message={loadError}
        >
          <Button title="Try again" variant="secondary" onPress={retry} />
        </StateView>
      </Screen>
    );
  }

  const initial = initials(profile.full_name || profile.email);
  const memberSince = profile.profile_created_at
    ? new Date(profile.profile_created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Screen
      scroll
      keyboard
      header={<Header title="Profile" hideBack />}
      tabBar={<TabBar active="profile" />}
      footer={
        nameChanged && (
          <Button
            title="Save changes"
            loading={saving}
            disabled={!canSave}
            onPress={saveProfile}
          />
        )
      }
    >
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <AppText variant="title" tone="accent">
            {initial}
          </AppText>
        </View>
        <AppText variant="heading" center>
          {profile.full_name || "No name yet"}
        </AppText>
        <AppText variant="small" tone="secondary" center>
          {profile.email}
        </AppText>
        {memberSince && (
          <AppText variant="caption" tone="muted" center>
            Member since {memberSince}
          </AppText>
        )}
      </View>

      <Card style={styles.card}>
        <TextField
          label="Full name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setSavedMessage(false);
          }}
          placeholder="Enter your name"
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
          returnKeyType="done"
          onSubmitEditing={saveProfile}
          editable={!saving}
        />
        {savedMessage && (
          <View style={styles.saved}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <AppText variant="small" tone="success">
              Name updated
            </AppText>
          </View>
        )}
      </Card>

      <View style={styles.menu}>
        {profile.is_admin && (
          <MenuRow
            label="Teaching workspace"
            hint="Admin"
            href="/admin"
          />
        )}
        <MenuRow label="Device info" href="/device" />
      </View>

      <Button
        title="Log out"
        variant="danger"
        onPress={() => setConfirmLogout(true)}
        style={styles.logout}
      />

      <ConfirmDialog
        visible={confirmLogout}
        title="Log out?"
        message="You'll need your email and password to log back in."
        confirmLabel="Log out"
        destructive
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          // The layout's Stack.Protected guard sends us to /login
          clearSession();
        }}
      />
    </Screen>
  );
}

// One tappable row in the settings-style menu
function MenuRow({
  label,
  hint,
  href,
}: {
  label: string;
  hint?: string;
  href: Href;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tapHaptic();
        router.push(href);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Bullet />
      <AppText variant="bodyStrong" style={styles.rowLabel}>
        {label}
      </AppText>
      {hint && (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = createStyles((colors) => ({
  identity: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  saved: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  menu: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  rowLabel: {
    flex: 1,
  },
  logout: {
    marginTop: spacing.xl,
  },
}));
