import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import * as Device from "expo-device";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Card } from "@/ui/Card";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing } from "@/ui/theme";

// Read-only details about the phone (expo-device) and the app version
// (expo-constants) - handy when reporting a bug.

type IconName = ComponentProps<typeof Ionicons>["name"];

function deviceType() {
  switch (Device.deviceType) {
    case Device.DeviceType.PHONE:
      return "Phone";
    case Device.DeviceType.TABLET:
      return "Tablet";
    case Device.DeviceType.DESKTOP:
      return "Desktop";
    default:
      return "Unknown";
  }
}

export default function DeviceScreen() {
  const rows: { icon: IconName; label: string; value: string }[] = [
    {
      icon: "phone-portrait-outline",
      label: "Device",
      value: Device.deviceName ?? Device.modelName ?? "Unknown",
    },
    { icon: "hardware-chip-outline", label: "Type", value: deviceType() },
    {
      icon: "layers-outline",
      label: "Operating system",
      value: [Device.osName, Device.osVersion].filter(Boolean).join(" ") || "Unknown",
    },
    {
      icon: "information-circle-outline",
      label: "App version",
      value: Constants.expoConfig?.version ?? "Unknown",
    },
  ];

  return (
    <Screen scroll header={<Header title="Device info" />}>
      <Card style={styles.card}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index < rows.length - 1 && styles.divider]}
          >
            <View style={styles.icon}>
              <Ionicons name={row.icon} size={20} color={colors.accentText} />
            </View>
            <View style={styles.text}>
              <AppText variant="caption" tone="muted">
                {row.label}
              </AppText>
              <AppText variant="bodyStrong">{row.value}</AppText>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
