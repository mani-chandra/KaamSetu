import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { radii, spacing, typography } from "@/constants/theme";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: Colors.light.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.title,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xl,
    maxWidth: 220,
  },
});
