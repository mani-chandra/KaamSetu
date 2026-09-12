import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryTile } from "@/components/ui/CategoryTile";
import { Screen } from "@/components/ui/Screen";
import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category, CategoryGroup } from "@/lib/types";

export default function HomeScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setGroups(data.groups))
      .finally(() => setLoading(false));
  }, []);

  const popular = useMemo(() => {
    const all: Category[] = [];
    groups.forEach((g) => all.push(...g.categories));
    return all.slice(0, 10);
  }, [groups]);

  const greeting = user?.name?.split(" ")[0] ?? "there";

  return (
    <Screen loading={loading} edges={[]} contentContainerStyle={styles.screenContent}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroInner}>
            <View>
              <Text style={styles.greeting}>Hello, {greeting} 👋</Text>
              <Text style={styles.heroTitle}>What do you need{"\n"}help with today?</Text>
            </View>
            <Pressable style={styles.searchBar} onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search plumbers, electricians…</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        {popular.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular services</Text>
              <Link href="/(tabs)/search" asChild>
                <Pressable>
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              </Link>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRow}
            >
              {popular.map((category, index) => (
                <CategoryTile
                  key={category.id}
                  slug={category.slug}
                  name={category.name}
                  icon={category.icon}
                  index={index}
                  compact
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {groups.map((group) => (
          <View key={group.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.name}</Text>
            <View style={styles.grid}>
              {group.categories.map((category, index) => (
                <CategoryTile
                  key={category.id}
                  slug={category.slug}
                  name={category.name}
                  icon={category.icon}
                  index={index}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.promoCard}>
          <Text style={styles.promoEmoji}>⭐</Text>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>Verified professionals</Text>
            <Text style={styles.promoBody}>
              Every pro is background-checked and rated by real customers.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 0,
    paddingBottom: 120,
  },
  hero: {
    paddingBottom: spacing.xxxl,
  },
  heroInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.lg,
  },
  greeting: {
    ...typography.subtitle,
    color: "rgba(255,255,255,0.85)",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.hero,
    color: "#fff",
    lineHeight: 34,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: spacing.sm,
    ...shadows.md,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    ...typography.body,
    color: Colors.light.muted,
    flex: 1,
  },
  body: {
    marginTop: -spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: Colors.light.text,
  },
  sectionLink: {
    ...typography.caption,
    color: Colors.light.brand,
    fontWeight: "700",
  },
  popularRow: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: Colors.light.brandSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.brandMuted,
    marginTop: spacing.sm,
  },
  promoEmoji: {
    fontSize: 28,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.brandDark,
    marginBottom: 2,
  },
  promoBody: {
    ...typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
});
