import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import type { Professional } from "@/lib/types";

export default function ProfessionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api
      .search({})
      .then((data) => {
        const match = data.professionals.find((item) => item.id === id) ?? null;
        setProfessional(match);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!loading && !professional) {
    return (
      <Screen scroll={false}>
        <EmptyState
          icon="😕"
          title="Professional not found"
          description="This profile may have been removed or is no longer available."
        />
      </Screen>
    );
  }

  const categorySlug = professional?.services[0]?.category?.slug ?? "general";

  return (
    <Screen loading={loading}>
      {professional ? (
        <>
          <View style={styles.heroCard}>
            {professional.user.image ? (
              <Image source={{ uri: professional.user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{professional.user.name?.[0] ?? "P"}</Text>
              </View>
            )}
            <Text style={styles.name}>{professional.user.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingValue}>{professional.avgRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCount}>{professional.reviewCount} reviews</Text>
            </View>
            {professional.user.city ? (
              <Text style={styles.city}>📍 {professional.user.city}</Text>
            ) : null}
          </View>

          {professional.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{professional.bio}</Text>
            </View>
          ) : null}

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{professional.experienceYears}</Text>
              <Text style={styles.statLabel}>Years experience</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{professional.completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs completed</Text>
            </View>
          </View>

          <Button
            label="Book this professional"
            onPress={() =>
              router.push({
                pathname: "/book/[categorySlug]",
                params: { categorySlug, proId: professional.id },
              })
            }
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: Colors.light.brandMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.light.brandDark,
  },
  name: {
    ...typography.hero,
    fontSize: 24,
    color: Colors.light.text,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  ratingStar: {
    color: "#d97706",
  },
  ratingValue: {
    fontWeight: "700",
    color: "#92400e",
  },
  reviewCount: {
    ...typography.caption,
    color: Colors.light.muted,
  },
  city: {
    ...typography.body,
    color: Colors.light.muted,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.brand,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 4,
  },
});
