import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Gap between one block appearing and the next
const STAGGER_MS = 35;

// Fades a block in while it rises a few pixels - quick and subtle. Give the blocks on a screen
// increasing `order` values and they appear one after another, top to
// bottom - one orchestrated entrance instead of everything popping in.
// (Reanimated follows the phone's "reduce motion" setting.)
export function Reveal({
  order = 0,
  children,
  style,
}: {
  order?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(order * STAGGER_MS)
        .duration(260)
        .withInitialValues({ opacity: 0, transform: [{ translateY: 6 }] })}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
