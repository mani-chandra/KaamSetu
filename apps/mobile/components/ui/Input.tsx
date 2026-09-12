import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import Colors from "@/constants/Colors";
import { radii, typography } from "@/constants/theme";

type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.light.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    ...typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputError: {
    borderColor: Colors.light.danger,
  },
  hint: {
    ...typography.caption,
    color: Colors.light.muted,
    marginTop: 6,
  },
  error: {
    ...typography.caption,
    color: Colors.light.danger,
    marginTop: 6,
  },
});
