import { Platform, TextStyle, ViewStyle } from "react-native";

import Colors from "./Colors";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  hero: { fontSize: 28, fontWeight: "800" as TextStyle["fontWeight"], letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: "700" as TextStyle["fontWeight"], letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: "500" as TextStyle["fontWeight"] },
  body: { fontSize: 15, fontWeight: "400" as TextStyle["fontWeight"] },
  caption: { fontSize: 13, fontWeight: "500" as TextStyle["fontWeight"] },
  label: { fontSize: 12, fontWeight: "600" as TextStyle["fontWeight"], letterSpacing: 0.3 },
} as const;

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: Colors.light.brand,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

export const categoryColors = [
  "#ecfdf5",
  "#eff6ff",
  "#fef3c7",
  "#fce7f3",
  "#f3e8ff",
  "#ecfeff",
  "#fff7ed",
  "#f0fdf4",
];

export function categoryAccent(index: number) {
  return categoryColors[index % categoryColors.length];
}
