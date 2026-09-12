import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import Colors from "@/constants/Colors";
import { radii, shadows, typography } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? Colors.light.brand : "#fff"} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.subtitle,
    fontWeight: "700",
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.light.brand,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: Colors.light.brandSoft,
  },
  outline: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: "#fff" },
  secondary: { color: Colors.light.brandDark },
  outline: { color: Colors.light.text },
  ghost: { color: Colors.light.brand },
  danger: { color: Colors.light.danger },
});
