import { StyleSheet } from "react-native";

import { colors, type Palette } from "@/ui/theme";

// The app has one light palette. These helpers keep the styling API the
// screens use: read colours with useTheme(), and build styles with
// createStyles(), which works like StyleSheet.create but takes a function
// of the palette and returns a hook.
//
//   const useStyles = createStyles((colors) => ({ card: { ... } }));
//   function Card() { const styles = useStyles(); ... }

export function useTheme() {
  return { colors };
}

export function createStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: Palette) => T,
) {
  const styles = StyleSheet.create(factory(colors));

  return function useStyles(): T {
    return styles;
  };
}
