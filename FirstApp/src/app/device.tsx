import Constants from "expo-constants";
import * as Device from "expo-device";
import { View } from "react-native";

import { AppText } from "@/ui/AppText";
import { Bullet } from "@/ui/Brand";
import { Card } from "@/ui/Card";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { spacing } from "@/ui/theme";
import { createStyles } from "@/ui/ThemeProvider";

// Read-only details about the phone (expo-device) and the app version
// (expo-constants) - handy when reporting a bug.

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
  const styles = useStyles();
  const rows: { label: string; value: string }[] = [
    {
      label: "Device",
      value: Device.deviceName ?? Device.modelName ?? "Unknown",
    },
    { label: "Type", value: deviceType() },
    {
      label: "Operating system",
      value: [Device.osName, Device.osVersion].filter(Boolean).join(" ") || "Unknown",
    },
    {
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
            <Bullet />
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

const useStyles = createStyles((colors) => ({
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: {
    flex: 1,
    gap: 2,
  },
}));
