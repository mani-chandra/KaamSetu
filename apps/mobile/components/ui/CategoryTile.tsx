import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { categoryAccent, radii, shadows, spacing, typography } from "@/constants/theme";

type CategoryTileProps = {
  slug: string;
  name: string;
  icon?: string | null;
  index: number;
  compact?: boolean;
};

export function CategoryTile({ slug, name, icon, index, compact = false }: CategoryTileProps) {
  const bg = categoryAccent(index);

  return (
    <Link href={`/category/${slug}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          compact ? styles.tileCompact : styles.tileRegular,
          { backgroundColor: bg },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{icon ?? "🔧"}</Text>
        </View>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
          {name}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    ...shadows.sm,
  },
  tileRegular: {
    width: "31%",
    minWidth: 104,
    alignItems: "center",
  },
  tileCompact: {
    width: 88,
    marginRight: spacing.sm,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  icon: {
    fontSize: 22,
  },
  name: {
    ...typography.caption,
    color: Colors.light.text,
    textAlign: "center",
    fontWeight: "700",
  },
  nameCompact: {
    fontSize: 11,
  },
});
