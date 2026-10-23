// The app's design tokens. Every screen uses these instead of hard-coded
// values, so colours, spacing and text sizes stay consistent everywhere.
//
// The look is a calm study notebook: warm off-white paper, white cards
// with hairline borders, one muted teal for whatever you can act on, and
// a deep green-black "ink" for selected filters. One sans family does all
// the type; weight and size carry the hierarchy.

export type Palette = {
  background: string; // the page
  surface: string; // cards
  surfaceRaised: string; // pressed cards, inputs, chips
  border: string;
  borderStrong: string; // empty radio circles, dividers that need weight
  text: string;
  textSecondary: string;
  textMuted: string;
  ink: string; // selected filter pills
  onInk: string;
  accent: string; // primary buttons, selected answers, progress
  accentPressed: string;
  accentSoft: string; // tinted panels and icon tiles
  accentText: string; // teal text on the background
  onAccent: string; // text and icons on an accent background
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  dangerPressed: string;
  warning: string;
  warningSoft: string;
  overlay: string;
};

export const colors: Palette = {
  background: "#F5F3EE",
  surface: "#FFFFFF",
  surfaceRaised: "#F0EEE8",
  border: "#E4E1D9",
  borderStrong: "#CFCBC1",
  text: "#1C2421",
  textSecondary: "#5C6661",
  textMuted: "#8D9590",
  ink: "#1F3330",
  onInk: "#FFFFFF",
  accent: "#4A8A82",
  accentPressed: "#3C746D",
  accentSoft: "#E3EEEB",
  accentText: "#38736B",
  onAccent: "#FFFFFF",
  success: "#3C8556",
  successSoft: "#E4F1E8",
  danger: "#BF4E3D",
  dangerSoft: "#FAEAE6",
  dangerPressed: "#F3D5CE",
  warning: "#A66E16",
  warningSoft: "#F9EDD8",
  overlay: "rgba(28, 36, 33, 0.36)",
};

// Font family names as loaded in _layout.tsx (from @expo-google-fonts).
// Custom fonts pick their weight by family name, not fontWeight.
export const fonts = {
  body: "SchibstedGrotesk_400Regular",
  bodyMedium: "SchibstedGrotesk_500Medium",
  bodySemiBold: "SchibstedGrotesk_600SemiBold",
  bodyBold: "SchibstedGrotesk_700Bold",
};

// A 4-point spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

// Text styles, from biggest to smallest
export const typography = {
  display: { fontFamily: fonts.bodyBold, fontSize: 44, lineHeight: 48, letterSpacing: -1 },
  title: { fontFamily: fonts.bodyBold, fontSize: 27, lineHeight: 33, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.bodySemiBold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  // Small uppercase eyebrow labels above headings and sections
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
} as const;

export const layout = {
  screenPadding: 20,
  buttonHeight: 50,
  buttonHeightSmall: 38,
  hitSlop: 10,
};
