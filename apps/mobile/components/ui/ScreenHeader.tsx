import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { spacing, typography } from "@/constants/theme";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  large?: boolean;
};

export function ScreenHeader({ title, subtitle, eyebrow, large = false }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.title, large && styles.titleLarge]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...typography.label,
    color: Colors.light.brand,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: Colors.light.text,
  },
  titleLarge: {
    ...typography.hero,
  },
  subtitle: {
    ...typography.body,
    color: Colors.light.muted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
