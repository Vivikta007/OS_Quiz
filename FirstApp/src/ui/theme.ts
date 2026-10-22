// The app's design tokens. Every screen uses these instead of hard-coded
// values, so colours, spacing and text sizes stay consistent everywhere.

export const colors = {
  background: "#0B1220",
  surface: "#131E32", // cards
  surfaceRaised: "#1A2740", // pressed cards, inputs, chips
  border: "#24324D",
  borderStrong: "#33456A",

  text: "#F1F5F9",
  textSecondary: "#A8B3C7",
  textMuted: "#64748B",

  accent: "#3B82F6",
  accentPressed: "#2563EB",
  accentSoft: "rgba(59, 130, 246, 0.14)",
  accentText: "#93C5FD",

  success: "#22C55E",
  successSoft: "rgba(34, 197, 94, 0.14)",
  danger: "#F87171",
  dangerSoft: "rgba(248, 113, 113, 0.12)",
  warning: "#F59E0B",
  warningSoft: "rgba(245, 158, 11, 0.14)",

  overlay: "rgba(5, 10, 20, 0.72)",
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
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
};

// Text styles, from biggest to smallest
export const typography = {
  display: { fontSize: 34, fontWeight: "800", letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 23 },
  bodyStrong: { fontSize: 16, fontWeight: "600", lineHeight: 23 },
  small: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "500" },
  // Small uppercase section labels - the only place we use capitals
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
} as const;

export const layout = {
  screenPadding: 20,
  buttonHeight: 52,
  buttonHeightSmall: 42,
  hitSlop: 10,
};
