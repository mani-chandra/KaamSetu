import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import type { Professional } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProfessionalCard({
  professional,
  categorySlug,
}: {
  professional: Professional;
  categorySlug?: string;
}) {
  const service = professional.services[0];
  const priceLabel = service?.price
    ? formatCurrency(service.price)
    : service?.minPrice
      ? `From ${formatCurrency(service.minPrice)}`
      : "Get quote";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {professional.user.image ? (
          <Image source={{ uri: professional.user.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{professional.user.name?.[0] ?? "P"}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{professional.user.name ?? "Professional"}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingValue}>{professional.avgRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>({professional.reviewCount} reviews)</Text>
          </View>
          {professional.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {professional.bio}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>{professional.experienceYears} yrs</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>{professional.completedJobs} jobs</Text>
        </View>
        {professional.user.city ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{professional.user.city}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Starting at</Text>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>
        <View style={styles.actions}>
          <Link href={`/professional/${professional.id}`} asChild>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>View</Text>
            </Pressable>
          </Link>
          <Link
            href={{
              pathname: "/book/[categorySlug]",
              params: {
                categorySlug: categorySlug ?? service?.category?.slug ?? "general",
                proId: professional.id,
              },
            }}
            asChild
          >
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Book</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: Colors.light.brandMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.brandDark,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 2,
  },
  ratingStar: {
    fontSize: 11,
    color: "#d97706",
  },
  ratingValue: {
    ...typography.caption,
    fontWeight: "700",
    color: "#92400e",
  },
  reviewCount: {
    ...typography.caption,
    color: Colors.light.muted,
  },
  bio: {
    ...typography.caption,
    color: Colors.light.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaChip: {
    backgroundColor: Colors.light.background,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  metaChipText: {
    ...typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  priceLabel: {
    ...typography.caption,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.brand,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  outlineButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  outlineButtonText: {
    ...typography.caption,
    fontWeight: "700",
    color: Colors.light.text,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: Colors.light.brand,
    ...shadows.sm,
  },
  primaryButtonText: {
    ...typography.caption,
    fontWeight: "700",
    color: "#fff",
  },
});
